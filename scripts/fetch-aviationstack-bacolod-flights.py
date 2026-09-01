#!/usr/bin/env python3
"""Build a compact Bacolod–Silay schedule snapshot from Aviationstack.

The updater makes exactly two requests: BCD arrivals and BCD departures. It
writes static JSON for the website, keeping the access key out of browsers and
making page views free. This is a timetable, not a live operational board.

Usage:
    AVIATIONSTACK_ACCESS_KEY=... python3 scripts/fetch-aviationstack-bacolod-flights.py
    AVIATIONSTACK_ACCESS_KEY=... python3 scripts/fetch-aviationstack-bacolod-flights.py --dry-run
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
from datetime import UTC, date, datetime, timedelta
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import urlopen
from zoneinfo import ZoneInfo

API_URL = 'https://api.aviationstack.com/v1/flights'
AIRPORT_IATA = 'BCD'
AIRPORT_ICAO = 'RPVB'
TIMEZONE = ZoneInfo('Asia/Manila')
DISPLAY_DAYS = 2
OUTPUT_PATH = (
    Path(__file__).resolve().parent.parent
    / 'src'
    / 'data'
    / 'flights'
    / 'bacolod-silay.json'
)


class UpstreamError(Exception):
    """Aviationstack returned a failed, empty, or malformed response."""


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


def field(record: dict, key: str) -> dict:
    value = record.get(key)
    return value if isinstance(value, dict) else {}


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


def relevant_side(record: dict, direction: str) -> dict:
    return field(record, 'arrival' if direction == 'arrivals' else 'departure')


def other_side(record: dict, direction: str) -> dict:
    return field(record, 'departure' if direction == 'arrivals' else 'arrival')


def flight_number(record: dict) -> str:
    flight = field(record, 'flight')
    return flight.get('iata') or flight.get('icao') or flight.get('number') or 'Unknown'


def flight_digits(value: str) -> str:
    """Marketing and operating numbers commonly share the numeric portion."""
    match = re.search(r'\d+$', value)
    return match.group() if match else value


def is_codeshare(record: dict) -> bool:
    return bool(field(field(record, 'flight'), 'codeshared'))


def is_bcd_movement(record: dict, direction: str) -> bool:
    return relevant_side(record, direction).get('iata') == AIRPORT_IATA


def schedule_in_dates(record: dict, direction: str, service_dates: set[date]) -> bool:
    scheduled = parse_datetime(relevant_side(record, direction).get('scheduled'))
    return scheduled is not None and scheduled.astimezone(TIMEZONE).date() in service_dates


def candidate_key(record: dict, direction: str) -> tuple[str, str, str, str]:
    scheduled = local_time(relevant_side(record, direction).get('scheduled')) or ''
    other_airport = other_side(record, direction).get('iata') or 'unknown'
    return direction, other_airport, scheduled, flight_digits(flight_number(record))


def candidate_quality(record: dict, direction: str) -> tuple[int, int, int]:
    side = relevant_side(record, direction)
    status = record.get('flight_status')
    return (
        int(bool(side.get('actual'))),
        int(bool(side.get('estimated'))),
        int(status in {'active', 'landed'}),
    )


def normalize(record: dict, direction: str, alternate_numbers: list[str]) -> dict:
    departure = field(record, 'departure')
    arrival = field(record, 'arrival')
    airline = field(record, 'airline')
    scheduled = local_time(relevant_side(record, direction).get('scheduled'))
    identifier = flight_number(record)

    return {
        'id': f'{direction}-{identifier}-{scheduled or "unscheduled"}',
        'airline': airline.get('name') or 'Unknown airline',
        'flightNumber': identifier,
        'alternateFlightNumbers': alternate_numbers,
        'origin': {'name': departure.get('airport'), 'iata': departure.get('iata')},
        'destination': {'name': arrival.get('airport'), 'iata': arrival.get('iata')},
        'scheduled': scheduled,
    }


def physical_flights(records: list[dict], direction: str, service_dates: set[date]) -> list[dict]:
    grouped: dict[tuple[str, str, str, str], list[dict]] = {}
    for record in records:
        if (
            not is_bcd_movement(record, direction)
            or is_codeshare(record)
            or not schedule_in_dates(record, direction, service_dates)
        ):
            continue
        grouped.setdefault(candidate_key(record, direction), []).append(record)

    normalized = []
    for candidates in grouped.values():
        selected = max(candidates, key=lambda record: candidate_quality(record, direction))
        primary = flight_number(selected)
        alternate_numbers = sorted(
            {flight_number(record) for record in candidates if flight_number(record) != primary}
        )
        normalized.append(normalize(selected, direction, alternate_numbers))

    return sorted(normalized, key=lambda flight: flight['scheduled'] or '9999-12-31T00:00:00+08:00')


def build_snapshot_from_records(records_by_direction: dict[str, list[dict]], retrieved_at: datetime) -> dict:
    local_retrieved_at = retrieved_at.astimezone(TIMEZONE)
    service_dates = {
        (local_retrieved_at + timedelta(days=offset)).date()
        for offset in range(DISPLAY_DAYS)
    }
    arrivals = physical_flights(records_by_direction['arrivals'], 'arrivals', service_dates)
    departures = physical_flights(records_by_direction['departures'], 'departures', service_dates)
    if not arrivals and not departures:
        raise UpstreamError('Aviationstack returned no BCD flights for today or tomorrow.')

    return {
        'schemaVersion': 2,
        'airport': {
            'name': 'Bacolod–Silay International Airport',
            'iata': AIRPORT_IATA,
            'icao': AIRPORT_ICAO,
            'timezone': 'Asia/Manila',
        },
        'source': {'name': 'Aviationstack', 'url': 'https://aviationstack.com/'},
        'retrievedAt': retrieved_at.isoformat(),
        'serviceDates': sorted(day.isoformat() for day in service_dates),
        'refreshCadence': 'daily',
        'arrivals': arrivals,
        'departures': departures,
    }


def build_snapshot(access_key: str) -> dict:
    retrieved_at = datetime.now(UTC)
    return build_snapshot_from_records(
        {
            'arrivals': request_flights(access_key, 'arrivals'),
            'departures': request_flights(access_key, 'departures'),
        },
        retrieved_at,
    )


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
    print(f'Updated {OUTPUT_PATH.relative_to(OUTPUT_PATH.parent.parent.parent)}')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
