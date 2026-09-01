import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Clock3,
  ExternalLink,
  MapPin,
  Plane,
  Radio,
} from 'lucide-react';
import { useState } from 'react';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import { Card, CardContent } from '../components/ui/Card';
import { Heading } from '../components/ui/Heading';
import Section from '../components/ui/Section';

type Direction = 'departures' | 'arrivals';

type Flight = {
  airline: string;
  flightNumber: string;
  place: string;
  code: string;
  scheduledTime: string;
  estimatedTime: string;
  status: 'On time' | 'Delayed' | 'Boarding' | 'Landed';
};

// Intentionally local-only until a licensed live-status provider is connected.
const localFlightBoard: Record<Direction, Flight[]> = {
  departures: [
    {
      airline: 'Cebu Pacific',
      flightNumber: '5J 474',
      place: 'Manila',
      code: 'MNL',
      scheduledTime: '06:30',
      estimatedTime: '06:30',
      status: 'On time',
    },
    {
      airline: 'Philippine Airlines',
      flightNumber: 'PR 2132',
      place: 'Manila',
      code: 'MNL',
      scheduledTime: '11:35',
      estimatedTime: '11:50',
      status: 'Delayed',
    },
    {
      airline: 'Cebu Pacific',
      flightNumber: '5J 2280',
      place: 'Cebu',
      code: 'CEB',
      scheduledTime: '12:20',
      estimatedTime: '12:20',
      status: 'Boarding',
    },
  ],
  arrivals: [
    {
      airline: 'Cebu Pacific',
      flightNumber: '5J 473',
      place: 'Manila',
      code: 'MNL',
      scheduledTime: '08:30',
      estimatedTime: '08:42',
      status: 'Landed',
    },
    {
      airline: 'Philippine Airlines',
      flightNumber: 'PR 2131',
      place: 'Manila',
      code: 'MNL',
      scheduledTime: '10:25',
      estimatedTime: '10:25',
      status: 'On time',
    },
    {
      airline: 'Cebu Pacific',
      flightNumber: '5J 2279',
      place: 'Cebu',
      code: 'CEB',
      scheduledTime: '11:40',
      estimatedTime: '11:55',
      status: 'Delayed',
    },
  ],
};

const airlineLinks = [
  {
    name: 'Cebu Pacific flight status',
    href: 'https://www.cebupacificair.com/en-PH/pages/travel-info/flight-status',
  },
  {
    name: 'Philippine Airlines flight status',
    href: 'https://www.philippineairlines.com/ph/en/flight-status.html',
  },
  {
    name: 'AirAsia Philippines',
    href: 'https://www.airasia.com/',
  },
];

const statusClasses: Record<Flight['status'], string> = {
  'On time': 'bg-emerald-50 text-emerald-800',
  Delayed: 'bg-amber-50 text-amber-800',
  Boarding: 'bg-sky-50 text-sky-800',
  Landed: 'bg-gray-100 text-gray-700',
};

export default function BacolodFlights() {
  const [direction, setDirection] = useState<Direction>('departures');
  const flights = localFlightBoard[direction];
  const DirectionIcon =
    direction === 'departures' ? ArrowUpFromLine : ArrowDownToLine;

  return (
    <>
      <SEO
        title="Bacolod–Silay Airport Flights"
        description="A local Bacolod–Silay Airport flight-board preview with airport information and official airline flight-status links."
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
                  A local-first flight-board preview for Bacolod–Silay Airport.
                  Live data is not connected yet, so the board below uses sample
                  records and is never a source for travel decisions.
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
                  <p className="font-semibold text-gray-900">
                    Live board planned
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    This page is ready for a licensed status-data provider.
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
                      Flight board
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                      Local demo data — live flight status is not connected.
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
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-4 py-3 font-semibold sm:px-6">
                        Flight
                      </th>
                      <th className="px-4 py-3 font-semibold">
                        {direction === 'departures' ? 'To' : 'From'}
                      </th>
                      <th className="px-4 py-3 font-semibold">Scheduled</th>
                      <th className="px-4 py-3 font-semibold">Estimate</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {flights.map((flight) => (
                      <tr key={`${direction}-${flight.flightNumber}`}>
                        <td className="px-4 py-4 sm:px-6">
                          <p className="font-medium text-gray-950">
                            {flight.flightNumber}
                          </p>
                          <p className="mt-0.5 text-xs text-gray-500">
                            {flight.airline}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2 text-gray-900">
                            <DirectionIcon
                              className="h-4 w-4 text-primary-700"
                              aria-hidden="true"
                            />
                            <span>{flight.place}</span>
                            <span className="text-xs text-gray-500">
                              {flight.code}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 tabular-nums text-gray-700">
                          {flight.scheduledTime}
                        </td>
                        <td className="px-4 py-4 tabular-nums text-gray-700">
                          {flight.estimatedTime}
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses[flight.status]}`}
                          >
                            {flight.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <Card>
              <CardContent className="p-5 sm:p-6">
                <h2 className="font-semibold text-gray-950">
                  Confirm directly with your airline
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  Airline status is the authority for check-in, gate, delay, and
                  cancellation updates.
                </p>
                <div className="mt-4 flex flex-col gap-2">
                  {airlineLinks.map((airline) => (
                    <a
                      key={airline.name}
                      href={airline.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-medium text-primary-800 transition-colors hover:bg-primary-50"
                    >
                      {airline.name}
                      <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 sm:p-6">
                <h2 className="font-semibold text-gray-950">What comes next</h2>
                <ol className="mt-3 space-y-2 text-sm leading-relaxed text-gray-600">
                  <li>
                    1. Connect a licensed airport-status feed on the server.
                  </li>
                  <li>
                    2. Replace these sample records with a cached live board.
                  </li>
                  <li>
                    3. Add a separate nearby-aircraft map with source
                    attribution.
                  </li>
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>
      </Section>
    </>
  );
}
