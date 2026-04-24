#!/usr/bin/env python3
"""
Convert a DOE Bacolod fuel-prices XLSX export (from @Shiro_Oni's Power BI)
into src/data/transparency/fuel-prices.json.

Usage:
    python3 scripts/import-fuel-prices.py <path-to-xlsx>

The XLSX must have a sheet named `f_FuelPrices` with columns:
    ReportDate | PRODUCT | Station | Price | MinPrice | MaxPrice

DOE updates prices weekly; drop a fresh XLSX in and re-run.

Requires: pip install openpyxl
"""
import json
import sys
from collections import defaultdict
from pathlib import Path
from statistics import mean

import openpyxl

PRODUCT_MAP = {
    'RON 91': 'Gasoline RON 91',
    'RON 95': 'Gasoline RON 95',
    'RON 97': 'Gasoline RON 97',
    'RON 100': 'Gasoline RON 100',
    'DIESEL': 'Diesel',
    'DIESEL PLUS': 'Diesel Plus',
    'KEROSENE': 'Kerosene',
}
PRODUCT_ORDER = list(PRODUCT_MAP.values())
OUTPUT_PATH = Path('src/data/transparency/fuel-prices.json')


def slug(s: str) -> str:
    return (
        s.lower()
        .replace('gasoline ron ', 'gas')
        .replace('diesel plus', 'dslplus')
        .replace('diesel', 'dsl')
        .replace('kerosene', 'krs')
        .replace(' ', '')
    )


def main(xlsx_path: str) -> None:
    wb = openpyxl.load_workbook(xlsx_path, data_only=True)
    ws = wb['f_FuelPrices']

    bucket = defaultdict(list)
    for i, row in enumerate(ws.iter_rows(values_only=True)):
        if i == 0:
            continue
        date, product, station, _price, mn, mx = row
        if date is None or product is None or mn is None or mx is None:
            continue
        fuel_type = PRODUCT_MAP.get(product)
        if not fuel_type:
            continue
        date_iso = (
            date.date().isoformat() if hasattr(date, 'date') else str(date)[:10]
        )
        bucket[(date_iso, fuel_type)].append((station, float(mn), float(mx)))

    snapshots = []
    for (date_iso, fuel_type), entries in bucket.items():
        mins = [e[1] for e in entries]
        maxs = [e[2] for e in entries]
        mids = [(e[1] + e[2]) / 2 for e in entries]
        snapshots.append({
            'id': f'fp-{date_iso}-{slug(fuel_type)}',
            'date': date_iso,
            'fuelType': fuel_type,
            'priceMin': round(min(mins), 2),
            'priceAvg': round(mean(mids), 2),
            'priceMax': round(max(maxs), 2),
            'stationCount': len(entries),
            'byStation': [
                {'station': s, 'priceMin': round(mn, 2), 'priceMax': round(mx, 2)}
                for (s, mn, mx) in sorted(entries, key=lambda e: e[0])
            ],
        })
    all_dates = sorted({s['date'] for s in snapshots})
    all_types = [t for t in PRODUCT_ORDER if any(s['fuelType'] == t for s in snapshots)]

    # Carry-forward: for each fuel type, fill missing weeks (within its reporting
    # window) with the prior week's values, marked stale so the UI can flag them.
    # Only real (non-stale) snapshots seed the carry-forward chain, so re-running
    # the script on already-processed data cannot propagate stale staleSince refs.
    carried = []
    for fuel_type in all_types:
        fuel_snapshots = {
            s['date']: s
            for s in snapshots
            if s['fuelType'] == fuel_type and not s.get('stale')
        }
        if not fuel_snapshots:
            continue
        real_dates = sorted(fuel_snapshots.keys())
        first_seen = real_dates[0]
        last_known = None
        for week in all_dates:
            if week < first_seen:
                continue
            if week in fuel_snapshots:
                last_known = fuel_snapshots[week]
                continue
            if last_known is None:
                continue
            carried.append({
                **last_known,
                'id': f'fp-{week}-{slug(fuel_type)}',
                'date': week,
                'stale': True,
                'staleSince': last_known['date'],
            })
    snapshots.extend(carried)

    snapshots.sort(
        key=lambda s: (
            -int(s['date'].replace('-', '')),
            PRODUCT_ORDER.index(s['fuelType']),
        ),
    )

    all_dates = sorted({s['date'] for s in snapshots}, reverse=True)
    latest_week = all_dates[0]
    stations_in_latest = set()
    for s in snapshots:
        if s['date'] == latest_week:
            for b in s['byStation']:
                stations_in_latest.add(b['station'])

    out = {
        'placeholder': False,
        'snapshots': snapshots,
        'filters': {
            'fuelTypes': all_types,
            'weeks': all_dates,
            'brands': sorted(stations_in_latest),
        },
        'stats': {
            'latestWeek': latest_week,
            'weeksTracked': len(all_dates),
            'fuelTypes': len(all_types),
            'stationsSurveyed': len(stations_in_latest),
        },
        'source': 'DOE Oil Industry Management Bureau',
        'sourceUrl': 'https://www.doe.gov.ph/oil-monitor',
        'contributor': 'Shiro_Oni',
        'lastUpdated': latest_week,
    }

    OUTPUT_PATH.write_text(json.dumps(out, indent=2))
    print(
        f'Wrote {len(snapshots)} snapshots across {len(all_dates)} weeks '
        f'({all_dates[-1]} to {all_dates[0]}), {len(all_types)} fuel types, '
        f'{len(stations_in_latest)} brands',
    )


if __name__ == '__main__':
    if len(sys.argv) != 2:
        print('Usage: python3 scripts/import-fuel-prices.py <path-to-xlsx>')
        sys.exit(1)
    main(sys.argv[1])
