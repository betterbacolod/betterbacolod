#!/usr/bin/env python3
"""Fetch a small, dated Bacolod–Silay flight snapshot from Aviationstack.

The updater makes exactly two requests: one for BCD arrivals and one for BCD
departures. It writes a static JSON file for the website, so visitors never
receive the API key and page views do not consume Aviationstack quota.

Usage:
    AVIATIONSTACK_ACCESS_KEY=... python3 scripts/fetch-aviationstack-bacolod-flights.py
    AVIATIONSTACK_ACCESS_KEY=... python3 scripts/fetch-aviationstack-bacolod-flights.py --dry-run
"""
from __future__ import annotations

import argparse
import json
import os
import sys
from datetime import UTC, datetime, timedelta
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import urlopen
from zoneinfo import ZoneInfo

API_URL = 'https://api.aviationstack.com/v1/flights'
AIRPORT_IATA = 'BCD'
AIRPORT_ICAO = 'RPVB'
TIMEZONE = ZoneInfo('Asia/Manila')
WINDOW_HOURS = 48
OUTPUT_PATH = (
    Path(__file__).resolve().parent.parent
    / 'src'
    / 'data'
    / 'flights'
    / 'bacolod-silay.json'
)


class UpstreamError(Exception):
    """Aviationstack returned a failed or malformed response."""


def request_flights(access_key: str, direction: str) -> list[dict]:
    parameter = 'arr_iata' if direction == 'arrivals' else 'dep_iata'
    query = urlencode({'access_key': access_key, parameter: AIRPORT_IATA, 'limit': 100})
    try:
        with urlopen(f'{API_URL}?{query}', timeout=30) as response:  # noqa: S310
            payload = json.load(response)
    except (HTTPError, URLError, TimeoutError, json.JSONDecodeError) as error:
        raise UpstreamError('Unable to retrieve Aviationstack flight data.') from error

    if not isinstance(payload, dict) or payload.get('error'):
        raise UpstreamError('Aviationstack rejected the flight-data request.')
    data = payload.get('data')
    if not isinstance(data, list):
        raise UpstreamError('Aviationstack returned an unexpected flight-data shape.')
    return [flight for flight in data if isinstance(flight, dict)]


def parse_datetime(value: object) -> datetime | None:
    if not isinstance(value, str):
        return None
    try:
        return datetime.fromisoformat(value.replace('Z', '+00:00'))
    except ValueError:
        return None


def local_time(value: object) -> str | None:
    instant = parse_datetime(value)
    return instant.astimezone(TIMEZONE).isoformat() if instant else None


def field(record: dict, key: str) -> dict:
    value = record.get(key)
    return value if isinstance(value, dict) else {}


def in_snapshot_window(record: dict, direction: str, start: datetime, end: datetime) -> bool:
    schedule = field(record, 'arrival' if direction == 'arrivals' else 'departure').get('scheduled')
    instant = parse_datetime(schedule)
    if instant is None:
        return False
    local_instant = instant.astimezone(TIMEZONE)
    return start <= local_instant < end


def normalize(record: dict, direction: str) -> dict:
    departure = field(record, 'departure')
    arrival = field(record, 'arrival')
    airline = field(record, 'airline')
    flight = field(record, 'flight')
    schedule_side = arrival if direction == 'arrivals' else departure
    scheduled = local_time(schedule_side.get('scheduled'))
    identifier = flight.get('iata') or flight.get('icao') or flight.get('number') or 'unknown'

    return {
        'id': f'{direction}-{identifier}-{scheduled or "unscheduled"}',
        'airline': airline.get('name') or 'Unknown airline',
        'flightNumber': identifier,
        'status': record.get('flight_status') or 'unknown',
        'origin': {
            'name': departure.get('airport'),
            'iata': departure.get('iata'),
            'icao': departure.get('icao'),
        },
        'destination': {
            'name': arrival.get('airport'),
            'iata': arrival.get('iata'),
            'icao': arrival.get('icao'),
        },
        'scheduled': scheduled,
        'estimated': local_time(schedule_side.get('estimated')),
        'actual': local_time(schedule_side.get('actual')),
        'terminal': schedule_side.get('terminal'),
        'gate': schedule_side.get('gate'),
        'delayMinutes': schedule_side.get('delay'),
    }


def build_snapshot(access_key: str) -> dict:
    retrieved_at = datetime.now(UTC)
    window_start = retrieved_at.astimezone(TIMEZONE)
    window_end = window_start + timedelta(hours=WINDOW_HOURS)
    snapshots: dict[str, list[dict]] = {}

    for direction in ('arrivals', 'departures'):
        records = request_flights(access_key, direction)
        flights = [
            normalize(record, direction)
            for record in records
            if in_snapshot_window(record, direction, window_start, window_end)
        ]
        snapshots[direction] = sorted(
            flights,
            key=lambda flight: flight['scheduled'] or '9999-12-31T00:00:00+08:00',
        )

    return {
        'airport': {
            'name': 'Bacolod–Silay International Airport',
            'iata': AIRPORT_IATA,
            'icao': AIRPORT_ICAO,
            'timezone': 'Asia/Manila',
        },
        'source': {'name': 'Aviationstack', 'url': 'https://aviationstack.com/'},
        'retrievedAt': retrieved_at.isoformat(),
        'windowEndsAt': window_end.isoformat(),
        'refreshCadence': 'daily',
        **snapshots,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--dry-run', action='store_true', help='Print the snapshot without writing it.')
    args = parser.parse_args()

    access_key = os.environ.get('AVIATIONSTACK_ACCESS_KEY', '').strip()
    if not access_key:
        print('AVIATIONSTACK_ACCESS_KEY is required.', file=sys.stderr)
        return 2

    try:
        snapshot = build_snapshot(access_key)
    except UpstreamError as error:
        print(error, file=sys.stderr)
        return 1

    rendered = f'{json.dumps(snapshot, indent=2, ensure_ascii=False)}\n'
    if args.dry_run:
        print(rendered)
        return 0

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(rendered, encoding='utf-8')
    print(f"Updated {OUTPUT_PATH.relative_to(OUTPUT_PATH.parent.parent.parent)}")
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
