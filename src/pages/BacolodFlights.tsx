import { Clock3, ExternalLink, MapPin, Plane, Radio } from 'lucide-react';
import { useState } from 'react';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import { Card, CardContent } from '../components/ui/Card';
import { Heading } from '../components/ui/Heading';
import Section from '../components/ui/Section';
import flightSnapshot from '../data/flights/bacolod-silay.json';

type Direction = 'arrivals' | 'departures';
type Flight = (typeof flightSnapshot.arrivals)[number];

const statusClasses: Record<string, string> = {
  active: 'bg-sky-50 text-sky-800',
  landed: 'bg-emerald-50 text-emerald-800',
  scheduled: 'bg-gray-100 text-gray-700',
  cancelled: 'bg-rose-50 text-rose-800',
  incident: 'bg-rose-50 text-rose-800',
  diverted: 'bg-amber-50 text-amber-800',
};

const statusLabel = (status: string) =>
  status.charAt(0).toUpperCase() + status.slice(1);

function formatTime(value: string | null) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-PH', {
    timeZone: flightSnapshot.airport.timezone,
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en-PH', {
    timeZone: flightSnapshot.airport.timezone,
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(new Date(value));
}

const statusLinks = [
  {
    name: 'FlightAware RPVB airport board',
    href: 'https://www.flightaware.com/live/airport/RPVB',
  },
  {
    name: 'Flightradar24 BCD airport board',
    href: 'https://www.flightradar24.com/data/airports/bcd',
  },
  {
    name: 'Cebu Pacific flight status',
    href: 'https://www.cebupacificair.com/en-PH/pages/travel-info/flight-status',
  },
  {
    name: 'Philippine Airlines flight status',
    href: 'https://www.philippineairlines.com/ph/en/flight-status.html',
  },
];

export default function BacolodFlights() {
  const [direction, setDirection] = useState<Direction>('departures');
  const flights = flightSnapshot[direction];
  const locationLabel = direction === 'arrivals' ? 'From' : 'To';

  return (
    <>
      <SEO
        title="Bacolod–Silay Airport Flights"
        description="A daily Bacolod–Silay Airport arrivals and departures snapshot, with official airline flight-status links."
        keywords="Bacolod flights, Bacolod Silay Airport flights, BCD flights, RPVB flights, Bacolod arrivals, Bacolod departures"
        url="/bacolod-flights"
      />
      <Section className="min-h-[60vh]">
        <div className="mx-auto max-w-5xl">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Bacolod–Silay flights' },
            ]}
          />

          <div className="mt-6 rounded-2xl bg-gradient-to-br from-primary-700 to-primary-950 p-6 text-white shadow-sm sm:p-8">
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary-100">
                  Bacolod–Silay International Airport
                </p>
                <Heading className="text-white">Flights from Bacolod</Heading>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-primary-100 sm:text-base">
                  A daily snapshot of listed arrivals and departures for the
                  next 48 hours. Confirm check-in, gates, delays, and
                  cancellations directly with your airline.
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3 rounded-xl bg-white/10 px-4 py-3 ring-1 ring-white/20">
                <Plane className="h-5 w-5" aria-hidden="true" />
                <div>
                  <p className="text-xs text-primary-100">Airport codes</p>
                  <p className="font-semibold">BCD · RPVB</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="flex gap-3 p-4">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary-700" />
                <div>
                  <p className="font-semibold text-gray-900">
                    Bagtic, Silay City
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    About 15 km northeast of Bacolod.
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex gap-3 p-4">
                <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-primary-700" />
                <div>
                  <p className="font-semibold text-gray-900">
                    Before you leave
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    Arrive early and confirm your flight with the airline.
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex gap-3 p-4">
                <Radio className="mt-0.5 h-5 w-5 shrink-0 text-primary-700" />
                <div>
                  <p className="font-semibold text-gray-900">Daily snapshot</p>
                  <p className="mt-1 text-sm text-gray-600">
                    Updated once daily, not a live airport board.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6 overflow-hidden">
            <CardContent className="p-0">
              <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="font-semibold text-gray-950">
                      Latest flight snapshot
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                      Listed flights through{' '}
                      {formatDateTime(flightSnapshot.windowEndsAt)}.
                    </p>
                  </div>
                  <div
                    className="inline-flex w-fit rounded-lg bg-gray-100 p-1"
                    role="tablist"
                    aria-label="Flight direction"
                  >
                    {(['departures', 'arrivals'] as Direction[]).map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        role="tab"
                        aria-selected={direction === tab}
                        onClick={() => setDirection(tab)}
                        className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                          direction === tab
                            ? 'bg-white text-primary-800 shadow-sm'
                            : 'text-gray-600 hover:text-gray-950'
                        }`}
                      >
                        {tab === 'departures' ? 'Departures' : 'Arrivals'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left text-sm">
                  <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-4 py-3 font-semibold sm:px-6">
                        Flight
                      </th>
                      <th className="px-4 py-3 font-semibold">
                        {locationLabel}
                      </th>
                      <th className="px-4 py-3 font-semibold">Scheduled</th>
                      <th className="px-4 py-3 font-semibold">Latest time</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {flights.map((flight: Flight) => {
                      const location =
                        direction === 'arrivals'
                          ? flight.origin
                          : flight.destination;
                      const latestTime = flight.actual ?? flight.estimated;
                      return (
                        <tr key={flight.id}>
                          <td className="px-4 py-4 sm:px-6">
                            <p className="font-medium text-gray-950">
                              {flight.flightNumber}
                            </p>
                            <p className="mt-0.5 text-xs text-gray-500">
                              {flight.airline}
                            </p>
                          </td>
                          <td className="px-4 py-4 text-gray-900">
                            <span>{location.name ?? 'Unknown airport'}</span>
                            {location.iata && (
                              <span className="ml-2 text-xs text-gray-500">
                                {location.iata}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-4 tabular-nums text-gray-700">
                            {formatTime(flight.scheduled)}
                          </td>
                          <td className="px-4 py-4 tabular-nums text-gray-700">
                            {formatTime(latestTime)}
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses[flight.status] ?? 'bg-gray-100 text-gray-700'}`}
                            >
                              {statusLabel(flight.status)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    {flights.length === 0 && (
                      <tr>
                        <td
                          className="px-4 py-8 text-center text-gray-600 sm:px-6"
                          colSpan={5}
                        >
                          No listed {direction} were returned for this snapshot
                          window.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <p className="mt-3 text-xs leading-relaxed text-gray-500">
            Snapshot retrieved {formatDateTime(flightSnapshot.retrievedAt)} ·
            Data:{' '}
            <a
              className="underline hover:text-primary-800"
              href={flightSnapshot.source.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {flightSnapshot.source.name}
            </a>
            . Times shown in Philippine time.
          </p>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <Card>
              <CardContent className="p-5 sm:p-6">
                <h2 className="font-semibold text-gray-950">
                  Confirm flight status
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  This is a dated information snapshot. Your airline is the
                  authority for check-in, gates, delays, and cancellations.
                </p>
                <div className="mt-4 flex flex-col gap-2">
                  {statusLinks.map((link) => (
                    <a
                      key={link.name}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-medium text-primary-800 transition-colors hover:bg-primary-50"
                    >
                      {link.name}
                      <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 sm:p-6">
                <h2 className="font-semibold text-gray-950">About this data</h2>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                  Aviationstack data is captured once daily to keep this service
                  low-cost. Flight information can change after the snapshot is
                  published.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </Section>
    </>
  );
}
