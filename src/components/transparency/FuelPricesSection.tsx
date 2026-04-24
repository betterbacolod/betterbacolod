import { ChevronDown, ExternalLink } from 'lucide-react';
import { useMemo, useState } from 'react';
import fuelData from '../../data/transparency/fuel-prices.json';
import FuelPricesChart, { FUEL_COLORS } from './FuelPricesChart';

type RawSnapshot = (typeof fuelData.snapshots)[number];
type BrandPrice = { station: string; priceMin: number; priceMax: number };
type FreshSnapshot = Omit<RawSnapshot, 'stale' | 'staleSince'>;
type StaleSnapshot = FreshSnapshot & { stale: true; staleSince: string };
type Snapshot = FreshSnapshot | StaleSnapshot;

const isStaleSnapshot = (s: Snapshot): s is StaleSnapshot =>
  'stale' in s && s.stale === true;

const allSnapshots = fuelData.snapshots as Snapshot[];

const GRADE_LABEL: Record<string, string> = {
  'Gasoline RON 91': 'Regular unleaded',
  'Gasoline RON 95': 'Premium',
  'Gasoline RON 97': 'Super premium',
  'Gasoline RON 100': 'Super premium',
  Diesel: 'Diesel',
  'Diesel Plus': 'Premium diesel',
  Kerosene: 'Kerosene',
};

const peso = (v: number) => `₱${v.toFixed(2)}`;
const priceRange = (p: { priceMin: number; priceMax: number }) =>
  p.priceMin === p.priceMax
    ? peso(p.priceMin)
    : `${peso(p.priceMin)} – ${peso(p.priceMax)}`;

const prettyBrand = (s: string) =>
  s === 'INDEPENDENT'
    ? 'Independent'
    : s
        .split(' ')
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const monthShort = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
const weekDates = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  const start = new Date(Date.UTC(y, m - 1, d));
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 6);
  return { start, end };
};
const formatWeekRange = (iso: string) => {
  const { start, end } = weekDates(iso);
  const sameYear = start.getUTCFullYear() === end.getUTCFullYear();
  const sameMonth = sameYear && start.getUTCMonth() === end.getUTCMonth();
  const startMonth = monthNames[start.getUTCMonth()];
  const endMonth = monthNames[end.getUTCMonth()];
  if (!sameYear) {
    return `${startMonth} ${start.getUTCDate()}, ${start.getUTCFullYear()} – ${endMonth} ${end.getUTCDate()}, ${end.getUTCFullYear()}`;
  }
  const endLabel = sameMonth
    ? `${end.getUTCDate()}`
    : `${endMonth} ${end.getUTCDate()}`;
  return `${startMonth} ${start.getUTCDate()} – ${endLabel}, ${end.getUTCFullYear()}`;
};
const formatWeekRangeShort = (iso: string) => {
  const { start, end } = weekDates(iso);
  const sameYear = start.getUTCFullYear() === end.getUTCFullYear();
  const sameMonth = sameYear && start.getUTCMonth() === end.getUTCMonth();
  const startMonth = monthShort[start.getUTCMonth()];
  const endMonth = monthShort[end.getUTCMonth()];
  if (!sameYear) {
    return `${startMonth} ${start.getUTCDate()} – ${endMonth} ${end.getUTCDate()}`;
  }
  return sameMonth
    ? `${startMonth} ${start.getUTCDate()}–${end.getUTCDate()}`
    : `${startMonth} ${start.getUTCDate()} – ${endMonth} ${end.getUTCDate()}`;
};
const formatDateShort = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return `${monthShort[m - 1]} ${d}, ${y}`;
};
const daysSinceWeekEnd = (iso: string) => {
  const { end } = weekDates(iso);
  const now = new Date();
  const diff = now.getTime() - end.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

function FuelRow({
  snapshot,
  prior,
}: {
  snapshot: Snapshot;
  prior?: Snapshot;
}) {
  const sortedBrands = [...(snapshot.byStation as BrandPrice[])].sort(
    (a, b) => a.priceMin - b.priceMin,
  );
  const cheapest = sortedBrands[0];
  if (!cheapest) return null;
  const delta = prior ? snapshot.priceAvg - prior.priceAvg : null;
  const grade = GRADE_LABEL[snapshot.fuelType] ?? snapshot.fuelType;
  const isStale = isStaleSnapshot(snapshot);
  const color = FUEL_COLORS[snapshot.fuelType] ?? '#6b7280';

  return (
    <details className="group rounded-xl bg-white border border-gray-200 open:shadow-md open:border-gray-300 transition-shadow overflow-hidden">
      <summary className="flex items-stretch gap-3 cursor-pointer list-none p-4 hover:bg-gray-50/70">
        <div
          className="w-1 rounded-full flex-shrink-0"
          style={{ backgroundColor: color }}
          aria-hidden="true"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[13px] font-semibold text-gray-900">{grade}</p>
            <p className="text-[11px] text-gray-400 tabular-nums">
              {snapshot.fuelType}
            </p>
            {isStale && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 text-[10px] font-medium">
                <span aria-hidden="true">no update</span>
                <span className="sr-only">
                  Carried forward from {snapshot.staleSince}
                </span>
              </span>
            )}
          </div>
          <p className="mt-1 text-[12px] text-gray-600 tabular-nums">
            Cheapest at{' '}
            <span className="font-semibold text-gray-900">
              {prettyBrand(cheapest.station)}
            </span>{' '}
            ·{' '}
            <span className="text-gray-500">
              {snapshot.stationCount} brand
              {snapshot.stationCount === 1 ? '' : 's'}
            </span>
          </p>
        </div>
        <div className="flex flex-col items-end justify-between gap-1 flex-shrink-0">
          <p className="text-2xl font-bold tabular-nums text-gray-900 leading-none">
            {peso(cheapest.priceMin)}
          </p>
          {delta !== null && !isStale ? (
            <p
              className={`text-[10px] tabular-nums font-medium flex items-center gap-0.5 ${
                delta > 0.005
                  ? 'text-rose-600'
                  : delta < -0.005
                    ? 'text-emerald-600'
                    : 'text-gray-500'
              }`}
            >
              <span aria-hidden="true">
                {delta > 0.005 ? '▲' : delta < -0.005 ? '▼' : '■'}
              </span>
              <span className="sr-only">
                {delta > 0.005
                  ? 'Increased by '
                  : delta < -0.005
                    ? 'Decreased by '
                    : 'Unchanged at '}
              </span>
              ₱{Math.abs(delta).toFixed(2)}
            </p>
          ) : (
            <p className="text-[10px] text-gray-400 tabular-nums">
              avg {peso(snapshot.priceAvg)}
            </p>
          )}
          <ChevronDown
            className="h-4 w-4 text-gray-400 transition-transform group-open:rotate-180"
            aria-hidden="true"
          />
        </div>
      </summary>

      <div className="px-4 pb-4 pt-3 border-t border-gray-100 bg-gray-50/40">
        <div className="flex items-baseline justify-between gap-3 mb-2">
          <p className="text-[11px] uppercase tracking-wide text-gray-500 font-semibold">
            {snapshot.stationCount === 1
              ? 'Only 1 brand'
              : `All ${snapshot.stationCount} brands`}
          </p>
          <p className="text-[11px] text-gray-500 tabular-nums flex-shrink-0">
            overall {priceRange(snapshot)} · avg {peso(snapshot.priceAvg)}
          </p>
        </div>
        <dl className="space-y-0.5">
          {sortedBrands.map((b) => (
            <div
              key={b.station}
              className="flex items-center justify-between gap-3 text-sm py-1.5 px-2 rounded"
            >
              <dt className="font-medium text-gray-800">
                {prettyBrand(b.station)}
              </dt>
              <dd className="tabular-nums text-gray-900">{priceRange(b)}</dd>
            </div>
          ))}
        </dl>
      </div>
    </details>
  );
}

export default function FuelPricesSection() {
  const [fuelFilter, setFuelFilter] = useState('');
  const [weekFilter, setWeekFilter] = useState('');

  const latestWeek = fuelData.stats.latestWeek;
  const weekShort = formatWeekRangeShort(latestWeek);
  const { end: latestEnd } = weekDates(latestWeek);
  const daysAgo = daysSinceWeekEnd(latestWeek);
  const latestEndIso = latestEnd.toISOString().slice(0, 10);

  const latestCards = useMemo(() => {
    const latestWeek = fuelData.stats.latestWeek;
    const priorWeek = fuelData.filters.weeks
      .filter((w) => w < latestWeek)
      .sort()
      .at(-1);
    const latest = allSnapshots.filter((s) => s.date === latestWeek);
    const prior = priorWeek
      ? allSnapshots.filter((s) => s.date === priorWeek)
      : [];
    const priorByType = new Map(prior.map((p) => [p.fuelType, p]));
    return latest.map((s) => ({
      snapshot: s,
      prior: priorByType.get(s.fuelType),
    }));
  }, []);

  const filtered = useMemo(() => {
    return allSnapshots.filter((s) => {
      const matchFuel = !fuelFilter || s.fuelType === fuelFilter;
      const matchWeek = !weekFilter || s.date === weekFilter;
      return matchFuel && matchWeek;
    });
  }, [fuelFilter, weekFilter]);

  return (
    <div className="space-y-5 lg:space-y-7">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-[11px] uppercase tracking-[0.12em] text-primary-600 font-semibold">
            Latest DOE report
          </p>
          {daysAgo >= 0 && (
            <span
              className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium tabular-nums ${
                daysAgo <= 7
                  ? 'bg-emerald-50 text-emerald-700'
                  : daysAgo <= 14
                    ? 'bg-amber-50 text-amber-700'
                    : 'bg-rose-50 text-rose-700'
              }`}
            >
              reported{' '}
              {daysAgo <= 0
                ? 'today'
                : daysAgo === 1
                  ? '1 day ago'
                  : `${daysAgo} days ago`}
            </span>
          )}
        </div>
        <h2 className="mt-0.5 text-xl sm:text-2xl font-bold text-gray-900 tabular-nums">
          {formatWeekRange(fuelData.stats.latestWeek)}
        </h2>
        <p className="mt-1 text-xs text-gray-500">
          {fuelData.stats.stationsSurveyed} brands surveyed ·{' '}
          <a
            href={fuelData.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-primary-700 inline-flex items-center gap-0.5"
          >
            DOE Oil Monitor
            <ExternalLink className="h-3 w-3" />
          </a>
        </p>
      </div>

      {/* Hero: price trend chart */}
      <div>
        <div className="flex items-baseline justify-between gap-3 mb-2">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              {fuelData.stats.weeksTracked}-week trend
            </h3>
            <p className="text-[11px] text-gray-500 tabular-nums">
              through {formatDateShort(latestEndIso)}
            </p>
          </div>
          <p className="text-[11px] text-gray-500 flex-shrink-0">
            tap legend to toggle
          </p>
        </div>
        <FuelPricesChart />
      </div>

      {/* Cheapest in latest report — flat list */}
      <div>
        <div className="flex items-baseline justify-between gap-3 mb-2">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Cheapest by fuel type
            </h3>
            <p className="text-[11px] text-gray-500 tabular-nums">
              as of {weekShort}
            </p>
          </div>
          <p className="text-[11px] text-gray-500 flex-shrink-0">
            tap a row for all brands
          </p>
        </div>
        <div className="space-y-2">
          {latestCards.map(({ snapshot, prior }) => (
            <FuelRow key={snapshot.id} snapshot={snapshot} prior={prior} />
          ))}
        </div>
      </div>

      {/* What's RON — inline help */}
      <details className="text-xs">
        <summary className="cursor-pointer list-none text-primary-700 hover:underline font-medium inline-flex items-center gap-1">
          <span>What do RON 91 / 95 / 97 / 100 mean?</span>
          <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
        </summary>
        <div className="mt-2 space-y-1 pl-3 border-l-2 border-gray-200 text-gray-600">
          <p>
            <span className="font-medium text-gray-800">RON</span> is the octane
            rating — higher number, higher resistance to knocking, higher price.
          </p>
          <p>
            <span className="font-medium text-gray-800">RON 91</span> regular
            unleaded · <span className="font-medium text-gray-800">RON 95</span>{' '}
            premium ·{' '}
            <span className="font-medium text-gray-800">RON 97 / 100</span>{' '}
            super premium ·{' '}
            <span className="font-medium text-gray-800">Diesel Plus</span>{' '}
            premium diesel.
          </p>
        </div>
      </details>

      {/* Full data table — collapsed */}
      <details className="group rounded-xl border border-gray-200 bg-white">
        <summary className="flex items-center justify-between gap-2 px-4 h-11 cursor-pointer list-none text-sm font-medium text-gray-800 rounded-xl hover:bg-gray-50">
          <span>
            All weekly snapshots ({fuelData.stats.weeksTracked} weeks)
          </span>
          <ChevronDown className="h-4 w-4 text-gray-400 transition-transform group-open:rotate-180" />
        </summary>
        <div className="p-3 space-y-3 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <select
                aria-label="Filter by fuel type"
                value={fuelFilter}
                onChange={(e) => setFuelFilter(e.target.value)}
                className="appearance-none w-full pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All fuel types</option>
                {fuelData.filters.fuelTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                aria-label="Filter by week"
                value={weekFilter}
                onChange={(e) => setWeekFilter(e.target.value)}
                className="appearance-none w-full pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All weeks</option>
                {fuelData.filters.weeks.map((w) => (
                  <option key={w} value={w}>
                    {formatWeekRangeShort(w)}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="max-h-[400px] overflow-y-auto">
              <table
                className="w-full text-sm"
                aria-label="Weekly fuel price snapshots"
              >
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th
                      scope="col"
                      className="text-left py-2 px-3 font-medium text-gray-600"
                    >
                      Week
                    </th>
                    <th
                      scope="col"
                      className="text-left py-2 px-3 font-medium text-gray-600"
                    >
                      Fuel
                    </th>
                    <th
                      scope="col"
                      className="text-right py-2 px-3 font-medium text-gray-600"
                    >
                      Price (₱/L)
                    </th>
                    <th
                      scope="col"
                      className="text-right py-2 px-3 font-medium text-gray-600 hidden md:table-cell"
                    >
                      Brands
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((s) => {
                    const stale = isStaleSnapshot(s);
                    const color = FUEL_COLORS[s.fuelType] ?? '#6b7280';
                    return (
                      <tr
                        key={s.id}
                        className={`hover:bg-gray-50 ${stale ? 'text-gray-400' : ''}`}
                      >
                        <td className="py-2 px-3 whitespace-nowrap tabular-nums text-[12px] text-gray-600">
                          {formatWeekRangeShort(s.date)}
                        </td>
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-2">
                            <span
                              className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: color }}
                              aria-hidden="true"
                            />
                            <span className="text-[13px]">
                              {GRADE_LABEL[s.fuelType] ?? s.fuelType}
                            </span>
                            {stale && (
                              <span className="text-[10px] uppercase tracking-wide text-amber-600 font-medium">
                                stale
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2 px-3 text-right whitespace-nowrap tabular-nums">
                          <div className="font-semibold text-gray-900">
                            {peso(s.priceAvg)}
                          </div>
                          <div className="text-[11px] text-gray-500">
                            {priceRange(s)}
                          </div>
                        </td>
                        <td className="py-2 px-3 text-right hidden md:table-cell tabular-nums text-gray-600">
                          {s.stationCount}
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-8 text-center text-gray-500"
                      >
                        No snapshots for this fuel type in the selected range
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </details>

      <p className="text-xs text-gray-500 pt-2">
        Source:{' '}
        <a
          href={fuelData.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          {fuelData.source}
        </a>{' '}
        · Updated weekly · Data contributed by{' '}
        <span className="font-medium">@{fuelData.contributor}</span> · Covering{' '}
        <span className="tabular-nums">{formatWeekRange(latestWeek)}</span> ·
        Report issues:{' '}
        <a
          href="https://sumbongsapangulo.ph/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          sumbongsapangulo.ph
        </a>
      </p>
    </div>
  );
}
