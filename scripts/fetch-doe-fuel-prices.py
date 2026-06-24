#!/usr/bin/env python3
"""
Fetch DOE Visayas Field Office weekly retail-pump-price PDF, extract Bacolod City
prices, and merge into src/data/transparency/fuel-prices.json.

DOE publishes a fresh PDF every Tuesday at:
    https://prod-cms.doe.gov.ph/documents/d/guest/vfo-price-monitoring-MMDDYY-pdf

The PDF covers the Tuesday->Monday week starting on the report date.
Bacolod City is always the first city block on page 1.

Usage:
    python3 scripts/fetch-doe-fuel-prices.py
        Fetch and merge the most recent Tuesday's report.

    python3 scripts/fetch-doe-fuel-prices.py --date 2026-04-21
        Fetch a specific Tuesday.

    python3 scripts/fetch-doe-fuel-prices.py --dry-run
        Parse and print what would change; do not write JSON.

    python3 scripts/fetch-doe-fuel-prices.py --backfill 2025-12-30 2026-04-21
        Iterate every Tuesday in [start, end] inclusive and merge each.

Exit codes:
    0  - JSON updated or already up-to-date
    78 - PDF returned 404 (DOE late on publishing); CI retries next day
    1  - parse error or unexpected schema; CI opens an issue

Requires: pdfplumber, requests (see requirements.txt).
"""
from __future__ import annotations

import argparse
import json
import logging
import os
import re
import sys
from dataclasses import dataclass
from datetime import date, timedelta
from pathlib import Path
from statistics import mean

import pdfplumber
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

LOG = logging.getLogger('fetch-doe-fuel-prices')

# --- Constants -----------------------------------------------------------

REPO_ROOT = Path(__file__).resolve().parent.parent
JSON_PATH = REPO_ROOT / 'src' / 'data' / 'transparency' / 'fuel-prices.json'
PDF_CACHE = Path('/tmp/doe-pdfs')
ERROR_LOG = PDF_CACHE / 'error.log'
URL_TEMPLATE = (
    'https://prod-cms.doe.gov.ph/documents/d/guest/vfo-price-monitoring-{mmddyy}-pdf'
)

EXPECTED_BRAND_COLUMNS = [
    'PETRON',
    'SHELL',
    'CALTEX',
    'PHOENIX',
    'TOTAL',
    'FLYING V',
    'SEAOIL',
    'JETTI',
    'INDEPENDENT',
]
HEADER_PRECEDING = 'PROVINCE'  # marks the column header row
TARGET_CITY = 'Bacolod City'

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

PRICE_MIN_BOUND = 20.0
PRICE_MAX_BOUND = 500.0

EXIT_OK = 0
EXIT_PARSE_ERROR = 1
EXIT_NETWORK_ERROR = 2
EXIT_NOT_PUBLISHED = 78


class PDFNotPublished(Exception):
    """DOE has not yet posted the report for this week (404)."""


class PDFFetchError(Exception):
    """Network or non-404 HTTP error fetching the DOE PDF."""


# --- Data shape ----------------------------------------------------------

@dataclass
class BrandPrice:
    station: str
    price_min: float
    price_max: float


# --- Date helpers --------------------------------------------------------

def most_recent_tuesday(today: date | None = None) -> date:
    """Return the most recent Tuesday on-or-before today."""
    today = today or date.today()
    # Mon=0, Tue=1, ..., Sun=6 -> map to days back to last Tuesday.
    days_back = (today.weekday() - 1) % 7
    return today - timedelta(days=days_back)


def url_for(report_date: date) -> str:
    return URL_TEMPLATE.format(mmddyy=report_date.strftime('%m%d%y'))


# --- Slug + helpers ------------------------------------------------------

def slug(s: str) -> str:
    return (
        s.lower()
        .replace('gasoline ron ', 'gas')
        .replace('diesel plus', 'dslplus')
        .replace('diesel', 'dsl')
        .replace('kerosene', 'krs')
        .replace(' ', '')
    )


def write_error(msg: str) -> None:
    PDF_CACHE.mkdir(parents=True, exist_ok=True)
    ERROR_LOG.write_text(msg)
    LOG.error(msg)


# --- PDF fetch + cache ---------------------------------------------------

def _build_session() -> requests.Session:
    """Build a requests session with retry on transient HTTP failures."""
    session = requests.Session()
    # DOE CMS sits behind Cloudflare which returns 403 to headless/bot UA strings
    # (common on GitHub Actions runners). A browser UA avoids the block.
    session.headers['User-Agent'] = (
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
        'AppleWebKit/537.36 (KHTML, like Gecko) '
        'Chrome/124.0.0.0 Safari/537.36'
    )
    retries = Retry(
        total=3,
        backoff_factor=1,
        status_forcelist=[500, 502, 503, 504],
        allowed_methods=['GET'],
        raise_on_status=False,
    )
    session.mount('https://', HTTPAdapter(max_retries=retries))
    session.mount('http://', HTTPAdapter(max_retries=retries))
    return session


def fetch_pdf(report_date: date) -> Path:
    """Download the DOE PDF for the given Tuesday.

    Raises PDFNotPublished on 404 (DOE has not posted yet).
    Raises PDFFetchError on any other failure (network, 5xx, malformed PDF).
    """
    PDF_CACHE.mkdir(parents=True, exist_ok=True)
    cache_path = PDF_CACHE / f'vfo-price-monitoring-{report_date.isoformat()}.pdf'
    if cache_path.exists() and cache_path.stat().st_size > 1024:
        LOG.info('Using cached PDF: %s', cache_path)
        return cache_path

    url = url_for(report_date)
    LOG.info('Fetching %s', url)
    try:
        resp = _build_session().get(url, timeout=30)
    except requests.RequestException as exc:
        raise PDFFetchError(f'Network error fetching {url}: {exc}') from exc
    if resp.status_code == 404:
        LOG.info('PDF not yet published (404): %s', url)
        raise PDFNotPublished(url)
    if resp.status_code == 403:
        # Cloudflare may return 403 (instead of 404) for missing docs when
        # accessed from CI runner IPs. Treat it as not-yet-published so the
        # workflow retries the next day rather than opening a noisy issue.
        LOG.info('PDF access blocked or not yet available (403): %s', url)
        raise PDFNotPublished(url)
    if resp.status_code != 200:
        raise PDFFetchError(f'Unexpected status {resp.status_code} for {url}')
    if not resp.content[:5].startswith(b'%PDF-'):
        raise PDFFetchError(
            f'Response is not a PDF (first bytes: {resp.content[:20]!r})',
        )
    cache_path.write_bytes(resp.content)
    return cache_path


# --- PDF parsing ---------------------------------------------------------

def _parse_price_cell(raw: str | None) -> tuple[float, float] | None:
    """Parse a brand price cell. Returns (min, max) or None if no usable data."""
    if raw is None:
        return None
    text = str(raw).strip().replace('\n', ' ')
    if not text or text == '-':
        return None
    # Strip stray whitespace around the dash.
    text = re.sub(r'\s*-\s*', '-', text)
    # DOE sometimes uses period-period separator instead of dash; normalize.
    if re.fullmatch(r'\d+\.\d+\.\d+\.\d+', text):
        # e.g. "91.50.102.30" -> assume the middle dot is the separator
        # split into two halves of equal-ish length
        parts = re.findall(r'\d+\.\d+', text)
        if len(parts) == 2:
            text = f'{parts[0]}-{parts[1]}'
    if '-' in text:
        parts = text.split('-')
        if len(parts) != 2:
            return None
        try:
            mn, mx = float(parts[0]), float(parts[1])
        except ValueError:
            return None
    else:
        try:
            mn = mx = float(text)
        except ValueError:
            return None
    if mn <= 0 or mx <= 0:
        return None
    if mn < PRICE_MIN_BOUND or mx > PRICE_MAX_BOUND:
        LOG.warning('Dropping out-of-range price cell: %r', raw)
        return None
    if mn > mx:
        # Swap if reversed (defensive).
        mn, mx = mx, mn
    return mn, mx


def parse_bacolod_table(pdf_path: Path) -> dict[str, list[BrandPrice]]:
    """Parse the PDF and return {fuel_type: [BrandPrice, ...]} for Bacolod City."""
    by_fuel: dict[str, list[BrandPrice]] = {}

    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            for table in page.extract_tables():
                by_fuel.update(_parse_bacolod_from_table(table))
                if by_fuel:
                    return by_fuel

    raise RuntimeError('Could not find Bacolod City prices in DOE PDF')


def _parse_bacolod_from_table(table: list[list[str | None]]) -> dict[str, list[BrandPrice]]:
    """Parse Bacolod City rows from one extracted DOE table."""
    if not table:
        return {}

    # Find header row. DOE occasionally inserts a leading blank column, so do
    # not assume PROVINCE is always in column 0.
    header_idx = None
    for i, row in enumerate(table):
        if row and any(
            (cell or '').strip().upper().startswith(HEADER_PRECEDING)
            for cell in row
        ):
            header_idx = i
            break
    if header_idx is None:
        return {}

    # DOE wraps long header labels (e.g. "CITY/MUNICIPALIT\nY") so collapse all
    # whitespace before matching.
    header = [
        re.sub(r'\s+', '', (c or '')).upper() for c in table[header_idx]
    ]
    brand_cols: dict[str, int] = {}
    for col_idx, label in enumerate(header):
        for brand in EXPECTED_BRAND_COLUMNS:
            if label == brand.replace(' ', ''):
                brand_cols[brand] = col_idx
                break
    missing_brands = [b for b in EXPECTED_BRAND_COLUMNS if b not in brand_cols]
    if missing_brands:
        return {}
    try:
        product_col = header.index('PRODUCT')
        city_col = next(
            i for i, h in enumerate(header) if h.startswith('CITY/MUNICIPALIT')
        )
    except (ValueError, StopIteration) as exc:
        raise RuntimeError(f'Expected column missing in header: {header}') from exc

    # Walk rows after the header until we find Bacolod City, then stay until the
    # next city or the OVERALL RANGE block at the bottom.
    in_bacolod = False
    by_fuel: dict[str, list[BrandPrice]] = {}
    for row in table[header_idx + 1 :]:
        if not row:
            continue
        cell_city = (row[city_col] or '').strip()
        if cell_city == TARGET_CITY:
            in_bacolod = True
        elif cell_city and cell_city != TARGET_CITY:
            if in_bacolod:
                break  # we've moved on to the next city
            continue
        if not in_bacolod:
            continue
        product_raw = (row[product_col] or '').strip().upper()
        fuel_type = PRODUCT_MAP.get(product_raw)
        if not fuel_type:
            continue
        for brand, col in brand_cols.items():
            parsed = _parse_price_cell(row[col])
            if parsed is None:
                continue
            mn, mx = parsed
            by_fuel.setdefault(fuel_type, []).append(
                BrandPrice(station=brand, price_min=mn, price_max=mx),
            )

    return by_fuel


# --- JSON merge + carry-forward ------------------------------------------

def build_snapshots(
    week_iso: str,
    by_fuel: dict[str, list[BrandPrice]],
) -> list[dict]:
    snapshots = []
    for fuel_type in PRODUCT_ORDER:
        entries = by_fuel.get(fuel_type)
        if not entries:
            continue
        entries.sort(key=lambda e: e.station)
        mins = [e.price_min for e in entries]
        maxs = [e.price_max for e in entries]
        mids = [(e.price_min + e.price_max) / 2 for e in entries]
        snapshots.append({
            'id': f'fp-{week_iso}-{slug(fuel_type)}',
            'date': week_iso,
            'fuelType': fuel_type,
            'priceMin': round(min(mins), 2),
            'priceAvg': round(mean(mids), 2),
            'priceMax': round(max(maxs), 2),
            'stationCount': len(entries),
            'byStation': [
                {
                    'station': e.station,
                    'priceMin': round(e.price_min, 2),
                    'priceMax': round(e.price_max, 2),
                }
                for e in entries
            ],
        })
    return snapshots


def apply_carry_forward(snapshots: list[dict]) -> list[dict]:
    """
    Fill missing (fuel_type, week) cells within each fuel type's reporting window
    with the prior week's values, marked stale. Mirrors the logic in
    scripts/import-fuel-prices.py so the UI's stale badge keeps working.
    """
    # Drop existing stale rows; we recompute from real data only.
    real = [s for s in snapshots if not s.get('stale')]
    all_dates = sorted({s['date'] for s in real})
    all_types = [
        t for t in PRODUCT_ORDER if any(s['fuelType'] == t for s in real)
    ]

    carried = []
    for fuel_type in all_types:
        fuel_snapshots = {
            s['date']: s for s in real if s['fuelType'] == fuel_type
        }
        if not fuel_snapshots:
            continue
        first_seen = min(fuel_snapshots)
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

    combined = real + carried
    combined.sort(
        key=lambda s: (
            -int(s['date'].replace('-', '')),
            PRODUCT_ORDER.index(s['fuelType'])
            if s['fuelType'] in PRODUCT_ORDER
            else 999,
        ),
    )
    return combined


def merge_into_json(week_iso: str, new_snapshots: list[dict]) -> bool:
    """Update fuel-prices.json with the new week's snapshots. Returns True if changed."""
    data = json.loads(JSON_PATH.read_text())

    new_ids = {s['id'] for s in new_snapshots}
    existing_real = [
        s for s in data['snapshots']
        if s['id'] not in new_ids and not s.get('stale')
    ]

    combined = existing_real + new_snapshots
    combined = apply_carry_forward(combined)

    if combined == data['snapshots']:
        return False

    data['placeholder'] = False
    data['snapshots'] = combined

    real_dates = sorted({s['date'] for s in combined if not s.get('stale')}, reverse=True)
    real_types = [
        t for t in PRODUCT_ORDER
        if any(s['fuelType'] == t and not s.get('stale') for s in combined)
    ]
    data['filters']['fuelTypes'] = real_types
    data['filters']['weeks'] = real_dates
    latest_week = real_dates[0]
    latest_brands = sorted({
        b['station']
        for s in combined
        if s['date'] == latest_week and not s.get('stale')
        for b in s['byStation']
    })
    data['filters']['brands'] = latest_brands
    data['stats']['latestWeek'] = latest_week
    data['stats']['weeksTracked'] = len(real_dates)
    data['stats']['fuelTypes'] = len(real_types)
    data['stats']['stationsSurveyed'] = len(latest_brands)
    data['lastUpdated'] = latest_week

    JSON_PATH.write_text(json.dumps(data, indent=2) + '\n')
    return True


def real_weeks_in_json() -> list[str]:
    """Return real (non-stale) imported week dates, newest first."""
    data = json.loads(JSON_PATH.read_text())
    return sorted(
        {s['date'] for s in data['snapshots'] if not s.get('stale')},
        reverse=True,
    )


# --- Top-level entry points ----------------------------------------------

def _emit_github_output(key: str, value: str) -> None:
    """Append a key=value line to $GITHUB_OUTPUT when running inside Actions."""
    output_path = os.environ.get('GITHUB_OUTPUT')
    if not output_path:
        return
    try:
        with open(output_path, 'a', encoding='utf-8') as f:
            f.write(f'{key}={value}\n')
    except OSError as exc:
        LOG.warning('Could not write to GITHUB_OUTPUT: %s', exc)


def process_week(report_date: date, dry_run: bool, pdf_path_override: Path | None = None) -> int:
    _emit_github_output('report_date', report_date.isoformat())

    if pdf_path_override is not None:
        pdf_path = pdf_path_override.resolve()
        if pdf_path.suffix.lower() != '.pdf':
            write_error(f'--pdf-path must point to a .pdf file: {pdf_path}')
            return EXIT_PARSE_ERROR
    else:
        try:
            pdf_path = fetch_pdf(report_date)
        except PDFNotPublished:
            return EXIT_NOT_PUBLISHED
        except PDFFetchError as exc:
            write_error(str(exc))
            return EXIT_NETWORK_ERROR

    try:
        by_fuel = parse_bacolod_table(pdf_path)
    except Exception as exc:  # noqa: BLE001 - surface any parse failure to CI
        write_error(f'Parse error for {report_date.isoformat()}: {exc}')
        return EXIT_PARSE_ERROR

    week_iso = report_date.isoformat()
    snapshots = build_snapshots(week_iso, by_fuel)
    if not snapshots:
        write_error(f'No snapshots produced for {week_iso}')
        return EXIT_PARSE_ERROR

    print(
        f'\n=== Week of {week_iso} ({len(snapshots)} fuel types, '
        f'{sum(s["stationCount"] for s in snapshots)} brand readings) ===',
    )
    for s in snapshots:
        brands = ', '.join(b['station'] for b in s['byStation'])
        print(
            f'  {s["fuelType"]:18} '
            f'min ₱{s["priceMin"]:.2f}  avg ₱{s["priceAvg"]:.2f}  max ₱{s["priceMax"]:.2f}  '
            f'({s["stationCount"]} brands: {brands})',
        )

    if dry_run:
        print('\n(dry-run: not writing JSON)')
        return EXIT_OK

    changed = merge_into_json(week_iso, snapshots)
    if changed:
        print(f'\n✓ Updated {JSON_PATH.relative_to(REPO_ROOT)}')
    else:
        print(f'\n• {JSON_PATH.relative_to(REPO_ROOT)} unchanged (week already present)')
    return EXIT_OK


def catch_up_missing_weeks(weeks: int, dry_run: bool) -> int:
    """
    Import missing Tuesdays inside a recent rolling window.

    GitHub-hosted runners can get transient 403s from DOE. A weekly-only job can
    then skip that week forever once the next Tuesday arrives, so automation uses
    this catch-up path and keeps checking a small rolling window.
    """
    target = most_recent_tuesday()
    imported_weeks = set(real_weeks_in_json())
    window_start = target - timedelta(days=7 * (weeks - 1))
    start = window_start

    while start.weekday() != 1:  # 1 = Tuesday
        start += timedelta(days=1)

    _emit_github_output('report_date', target.isoformat())

    missing_weeks = []
    current = start
    while current <= target:
        if current.isoformat() not in imported_weeks:
            missing_weeks.append(current)
        current += timedelta(days=7)

    if not missing_weeks:
        print(f'No missing DOE weeks to check through {target.isoformat()}')
        _emit_github_output('parse_errors', '0')
        _emit_github_output('network_errors', '0')
        _emit_github_output('not_published', '0')
        _emit_github_output('checked_weeks', '0')
        return EXIT_OK

    print(
        'Checking missing DOE reports: '
        + ', '.join(week.isoformat() for week in missing_weeks),
    )

    before = JSON_PATH.read_text()
    parse_errors = 0
    network_errors = 0
    not_published = 0
    checked = 0

    for current in missing_weeks:
        checked += 1
        rc = process_week(current, dry_run)
        if rc == EXIT_PARSE_ERROR:
            parse_errors += 1
        elif rc == EXIT_NETWORK_ERROR:
            network_errors += 1
        elif rc == EXIT_NOT_PUBLISHED:
            not_published += 1
            print(f'\n• DOE report not published yet for {current.isoformat()}')

    changed = JSON_PATH.read_text() != before
    latest_after = real_weeks_in_json()
    latest_label = latest_after[0] if latest_after else target.isoformat()

    _emit_github_output('report_date', latest_label)
    _emit_github_output('parse_errors', str(parse_errors))
    _emit_github_output('network_errors', str(network_errors))
    _emit_github_output('not_published', str(not_published))
    _emit_github_output('checked_weeks', str(checked))

    print(
        '\nCatch-up summary: '
        f'changed={changed}, checked={checked}, parse_errors={parse_errors}, '
        f'network_errors={network_errors}, not_published={not_published}',
    )

    # Return success so the workflow can still open a PR for any successful
    # imports; separate outputs decide whether to file diagnostic issues.
    return EXIT_OK


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument(
        '--date',
        type=date.fromisoformat,
        help='Tuesday-aligned week date (YYYY-MM-DD). Defaults to most recent Tuesday.',
    )
    p.add_argument(
        '--dry-run',
        action='store_true',
        help='Parse and print without modifying the JSON.',
    )
    p.add_argument(
        '--backfill',
        nargs=2,
        metavar=('START', 'END'),
        type=date.fromisoformat,
        help='Iterate every Tuesday between START and END (inclusive).',
    )
    p.add_argument(
        '--catch-up-weeks',
        type=int,
        metavar='N',
        help='Check up to N recent Tuesdays after the latest imported week.',
    )
    p.add_argument(
        '--pdf-path',
        type=Path,
        help='Use a local PDF instead of fetching (for testing).',
    )
    p.add_argument(
        '-v', '--verbose',
        action='store_true',
        help='Enable verbose logging.',
    )
    return p.parse_args()


def main() -> int:
    args = parse_args()
    logging.basicConfig(
        level=logging.DEBUG if args.verbose else logging.INFO,
        format='%(levelname)s %(message)s',
    )

    if args.catch_up_weeks is not None and args.catch_up_weeks < 1:
        LOG.error('--catch-up-weeks must be at least 1')
        return EXIT_PARSE_ERROR

    if sum(bool(v) for v in [args.backfill, args.pdf_path, args.catch_up_weeks]) > 1:
        LOG.error('--backfill, --pdf-path, and --catch-up-weeks are mutually exclusive')
        return EXIT_PARSE_ERROR

    if args.catch_up_weeks:
        return catch_up_missing_weeks(args.catch_up_weeks, args.dry_run)

    if args.backfill:
        start, end = args.backfill
        # Snap start to next Tuesday-on-or-after.
        while start.weekday() != 1:  # 1 = Tuesday
            start += timedelta(days=1)
        last_exit = EXIT_OK
        while start <= end:
            rc = process_week(start, args.dry_run)
            if rc == EXIT_PARSE_ERROR:
                return rc
            if rc != EXIT_OK:
                last_exit = rc
            start += timedelta(days=7)
        return last_exit

    target = args.date or most_recent_tuesday()
    if target.weekday() != 1:
        LOG.warning(
            'Target date %s is %s; DOE reports are dated Tuesdays. Continuing anyway.',
            target.isoformat(), target.strftime('%A'),
        )
    return process_week(target, args.dry_run, args.pdf_path)


if __name__ == '__main__':
    sys.exit(main())
