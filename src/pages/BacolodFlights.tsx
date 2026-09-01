import {
  CalendarDays,
  Clock3,
  ExternalLink,
  Plane,
  PlaneLanding,
  PlaneTakeoff,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import { Card, CardContent } from '../components/ui/Card';
import { Heading } from '../components/ui/Heading';
import Section from '../components/ui/Section';
import flightSnapshot from '../data/flights/bacolod-silay.json';

type Direction = 'arrivals' | 'departures';
type Flight = (typeof flightSnapshot.arrivals)[number];

const liveBoardUrl = 'https://www.flightaware.com/live/airport/RPVB';

const airlineStatusLinks = [
  {
    name: 'Cebu Pacific flight status',
    href: 'https://www.cebupacificair.com/en-PH/pages/travel-info/flight-status',
  },
  {
    name: 'Philippine Airlines flight status',
    href: 'https://www.philippineairlines.com/ph/en/flight-status.html',
  },
  {
    name: 'AirAsia flight status',
    href: 'https://www.airasia.com/aa/about-us/en/gb/flight-status.html',
  },
];

function formatTime(value: string) {
  return new Intl.DateTimeFormat('en-PH', {
    timeZone: flightSnapshot.airport.timezone,
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

function formatDate(value: string, includeYear = false) {
  return new Intl.DateTimeFormat('en-PH', {
    timeZone: flightSnapshot.airport.timezone,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    ...(includeYear ? { year: 'numeric' } : {}),
  }).format(new Date(`${value}T12:00:00+08:00`));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en-PH', {
    timeZone: flightSnapshot.airport.timezone,
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(new Date(value));
}

function localDate(value: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: flightSnapshot.airport.timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(value));
  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value]),
  );
  return `${values.year}-${values.month}-${values.day}`;
}

function todayInPht() {
  return localDate(new Date().toISOString());
}

function FlightRows({
  direction,
  flights,
}: {
  direction: Direction;
  flights: Flight[];
}) {
  const locationLabel = direction === 'departures' ? 'To' : 'From';

  if (flights.length === 0) {
    return (
      <div className="px-5 py-10 text-center text-sm text-gray-600 sm:px-6">
        No {direction} are listed in this schedule snapshot for this date.
      </div>
    );
  }

  return (
    <>
      <div className="divide-y divide-gray-100 md:hidden">
        {flights.map((flight) => {
          const location =
            direction === 'departures' ? flight.destination : flight.origin;
          return (
            <article key={flight.id} className="px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xl font-semibold tabular-nums text-gray-950">
                    {formatTime(flight.scheduled)}
                  </p>
                  <p className="mt-1 text-xs font-medium uppercase tracking-wide text-gray-500">
                    Scheduled PHT
                  </p>
                </div>
                <p className="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-800">
                  {flight.flightNumber}
                </p>
              </div>
              <div className="mt-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    {locationLabel}
                  </p>
                  <p className="mt-1 font-semibold text-gray-950">
                    {location.name ?? 'Unknown airport'}
                    {location.iata && (
                      <span className="ml-2 text-sm font-medium text-gray-500">
                        {location.iata}
                      </span>
                    )}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">{flight.airline}</p>
                  {flight.alternateFlightNumbers.length > 0 && (
                    <p className="mt-1 text-xs text-gray-500">
                      Also marketed as{' '}
                      {flight.alternateFlightNumbers.join(', ')}
                    </p>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-6 py-3 font-semibold">Scheduled</th>
              <th className="px-6 py-3 font-semibold">Flight</th>
              <th className="px-6 py-3 font-semibold">{locationLabel}</th>
              <th className="px-6 py-3 font-semibold">Airline</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {flights.map((flight) => {
              const location =
                direction === 'departures' ? flight.destination : flight.origin;
              return (
                <tr key={flight.id}>
                  <td className="px-6 py-4 text-base font-semibold tabular-nums text-gray-950">
                    {formatTime(flight.scheduled)}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-primary-800">
                      {flight.flightNumber}
                    </p>
                    {flight.alternateFlightNumbers.length > 0 && (
                      <p className="mt-1 text-xs text-gray-500">
                        Also {flight.alternateFlightNumbers.join(', ')}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-950">
                    {location.name ?? 'Unknown airport'}
                    {location.iata && (
                      <span className="ml-2 text-xs font-medium text-gray-500">
                        {location.iata}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-700">{flight.airline}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default function BacolodFlights() {
  const [direction, setDirection] = useState<Direction>('departures');
  const today = todayInPht();
  const defaultDate = flightSnapshot.serviceDates.includes(today)
    ? today
    : flightSnapshot.serviceDates[0];
  const [selectedDate, setSelectedDate] = useState(defaultDate);
  const flights = flightSnapshot[direction].filter(
    (flight) => localDate(flight.scheduled) === selectedDate,
  );
  const nextFlight = useMemo(
    () =>
      [...flightSnapshot.arrivals, ...flightSnapshot.departures]
        .filter((flight) => new Date(flight.scheduled).getTime() >= Date.now())
        .sort(
          (first, second) =>
            new Date(first.scheduled).getTime() -
            new Date(second.scheduled).getTime(),
        )[0],
    [],
  );
  const nextDirection = nextFlight
    ? flightSnapshot.departures.some((flight) => flight.id === nextFlight.id)
      ? 'departure'
      : 'arrival'
    : null;

  return (
    <>
      <SEO
        title="Bacolod–Silay Airport Schedule"
        description="Today and tomorrow's scheduled arrivals and departures at Bacolod–Silay Airport (BCD/RPVB)."
        keywords="Bacolod flights, Bacolod Silay Airport schedule, BCD flights, RPVB flights, Bacolod arrivals, Bacolod departures"
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
                  BCD · RPVB · Philippine time
                </p>
                <Heading className="text-white">
                  Bacolod–Silay flight schedule
                </Heading>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-primary-100 sm:text-base">
                  Scheduled flights to and from Bacolod for today and tomorrow.
                  For live delays, gates, cancellations, or check-in, confirm
                  with your airline.
                </p>
              </div>
              <a
                href={liveBoardUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-primary-900 transition-colors hover:bg-primary-50"
              >
                Live airport board
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>

          {nextFlight && (
            <Card className="mt-5 border-primary-100 bg-primary-50/50">
              <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div className="flex items-center gap-3">
                  <Clock3
                    className="h-5 w-5 shrink-0 text-primary-700"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary-800">
                      Next scheduled movement
                    </p>
                    <p className="mt-1 font-semibold text-gray-950">
                      {formatTime(nextFlight.scheduled)} ·{' '}
                      {nextFlight.flightNumber} ·{' '}
                      {nextDirection === 'departure' ? 'to' : 'from'}{' '}
                      {
                        (nextDirection === 'departure'
                          ? nextFlight.destination
                          : nextFlight.origin
                        ).name
                      }
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">Scheduled time only</p>
              </CardContent>
            </Card>
          )}

          <Card className="mt-5 overflow-hidden">
            <CardContent className="p-0">
              <div className="border-b border-gray-200 px-5 py-5 sm:px-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-gray-950">
                      <Plane
                        className="h-5 w-5 text-primary-700"
                        aria-hidden="true"
                      />
                      <h2 className="font-semibold">Airport timetable</h2>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      One listing per physical BCD flight. Codeshare duplicates
                      are removed.
                    </p>
                  </div>
                  <div
                    className="inline-flex w-fit rounded-lg bg-gray-100 p-1"
                    role="tablist"
                    aria-label="Flight direction"
                  >
                    {(['departures', 'arrivals'] as Direction[]).map((tab) => {
                      const Icon =
                        tab === 'departures' ? PlaneTakeoff : PlaneLanding;
                      return (
                        <button
                          key={tab}
                          type="button"
                          role="tab"
                          aria-selected={direction === tab}
                          onClick={() => setDirection(tab)}
                          className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                            direction === tab
                              ? 'bg-white text-primary-800 shadow-sm'
                              : 'text-gray-600 hover:text-gray-950'
                          }`}
                        >
                          <Icon className="h-4 w-4" aria-hidden="true" />
                          {tab === 'departures'
                            ? 'Departing Bacolod'
                            : 'Arriving Bacolod'}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div
                  className="mt-5 flex gap-2 overflow-x-auto pb-1"
                  role="group"
                  aria-label="Schedule date"
                >
                  {flightSnapshot.serviceDates.map((date) => (
                    <button
                      key={date}
                      type="button"
                      onClick={() => setSelectedDate(date)}
                      className={`inline-flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                        selectedDate === date
                          ? 'border-primary-700 bg-primary-700 text-white'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-primary-300 hover:text-primary-800'
                      }`}
                    >
                      <CalendarDays className="h-4 w-4" aria-hidden="true" />
                      {date === today ? 'Today' : formatDate(date)}
                    </button>
                  ))}
                </div>
              </div>

              <FlightRows direction={direction} flights={flights} />
            </CardContent>
          </Card>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <Card>
              <CardContent className="p-5 sm:p-6">
                <h2 className="font-semibold text-gray-950">
                  Confirm live status
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  Airline information is authoritative for check-in, gates,
                  delays, and cancellations.
                </p>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {airlineStatusLinks.map((link) => (
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
                <h2 className="font-semibold text-gray-950">
                  About this timetable
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  Last refreshed {formatDateTime(flightSnapshot.retrievedAt)}{' '}
                  from{' '}
                  <a
                    className="font-medium text-primary-800 underline hover:text-primary-950"
                    href={flightSnapshot.source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {flightSnapshot.source.name}
                  </a>
                  . It is updated daily and is not a live airport operations
                  feed.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </Section>
    </>
  );
}
