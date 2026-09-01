import importlib.util
import unittest
from datetime import UTC, datetime
from pathlib import Path


SPEC = importlib.util.spec_from_file_location(
    'flight_updater',
    Path(__file__).with_name('fetch-aviationstack-bacolod-flights.py'),
)
updater = importlib.util.module_from_spec(SPEC)
assert SPEC.loader is not None
SPEC.loader.exec_module(updater)


def record(
    flight_iata: str,
    *,
    arrival_iata: str = 'BCD',
    departure_iata: str = 'MNL',
    scheduled: str = '2026-09-01T10:00:00+00:00',
    actual: str | None = None,
    codeshared: dict | None = None,
) -> dict:
    return {
        'flight_status': 'active' if actual else 'scheduled',
        'airline': {'name': 'Example Air'},
        'flight': {
            'iata': flight_iata,
            'codeshared': codeshared,
        },
        'departure': {
            'airport': 'Manila',
            'iata': departure_iata,
            'scheduled': scheduled,
            'actual': actual,
        },
        'arrival': {
            'airport': 'Bacolod',
            'iata': arrival_iata,
            'scheduled': scheduled,
            'actual': actual,
        },
    }


class FlightSnapshotTests(unittest.TestCase):
    retrieved_at = datetime(2026, 9, 1, 1, tzinfo=UTC)

    def test_keeps_only_bcd_movements_for_today_and_tomorrow(self):
        snapshot = updater.build_snapshot_from_records(
            {
                'arrivals': [
                    record('5J100'),
                    record('5J101', arrival_iata='CEB'),
                    record('5J102', scheduled='2026-09-03T10:00:00+00:00'),
                ],
                'departures': [
                    record('5J200', departure_iata='BCD', arrival_iata='CEB'),
                    record('5J201', departure_iata='CEB'),
                ],
            },
            self.retrieved_at,
        )

        self.assertEqual([flight['flightNumber'] for flight in snapshot['arrivals']], ['5J100'])
        self.assertEqual([flight['flightNumber'] for flight in snapshot['departures']], ['5J200'])
        self.assertEqual(snapshot['serviceDates'], ['2026-09-01', '2026-09-02'])

    def test_removes_codeshares_and_collapses_operating_marketing_duplicates(self):
        snapshot = updater.build_snapshot_from_records(
            {
                'arrivals': [
                    record('PR2135'),
                    record('2P2135', actual='2026-09-01T10:05:00+00:00'),
                    record('NH5253', codeshared={'flight_iata': '2P2135'}),
                ],
                'departures': [],
            },
            self.retrieved_at,
        )

        self.assertEqual(len(snapshot['arrivals']), 1)
        self.assertEqual(snapshot['arrivals'][0]['flightNumber'], '2P2135')
        self.assertEqual(snapshot['arrivals'][0]['alternateFlightNumbers'], ['PR2135'])

    def test_rejects_an_empty_bcd_snapshot(self):
        with self.assertRaises(updater.UpstreamError):
            updater.build_snapshot_from_records(
                {'arrivals': [], 'departures': []}, self.retrieved_at
            )


if __name__ == '__main__':
    unittest.main()
