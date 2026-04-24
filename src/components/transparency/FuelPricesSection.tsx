import { ChevronDown, ChevronRight, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import fuelData from '../../data/transparency/fuel-prices.json';
import FuelPricesChart from './FuelPricesChart';

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

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

function FuelCard({
  snapshot,
  prior,
}: {
  snapshot: Snapshot;
  prior?: Snapshot;
}) {
  const [open, setOpen] = useState(false);
  const sortedBrands = [...(snapshot.byStation as BrandPrice[])].sort(
    (a, b) => a.priceMin - b.priceMin,
  );
  const cheapest = sortedBrands[0];
  if (!cheapest) return null;
  const delta = prior ? snapshot.priceAvg - prior.priceAvg : null;
  const grade = GRADE_LABEL[snapshot.fuelType] ?? snapshot.fuelType;
  const labelId = `fuel-${slugify(snapshot.fuelType)}-${snapshot.date}`;
  const isStale = isStaleSnapshot(snapshot);
  const staleSince = isStale ? snapshot.staleSince : undefined;

  return (
    <article
      aria-labelledby={labelId}
      className="border border-gray-200 rounded-lg bg-white flex flex-col"
    >
      <div className="p-4 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p
              id={labelId}
              className="text-[11px] uppercase tracking-wide font-semibold text-gray-500"
            >
              {grade}
            </p>
            <p className="text-[11px] text-gray-400">{snapshot.fuelType}</p>
          </div>
          {isStale && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-medium whitespace-nowrap">
              <span aria-hidden="true">no update</span>
              <span className="sr-only">Carried forward from {staleSince}</span>
            </span>
          )}
        </div>

        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-3xl font-bold tabular-nums text-gray-900">
            {peso(snapshot.priceAvg)}
          </span>
          <span className="text-[11px] text-gray-500">avg/L</span>
        </div>

        <p className="text-xs text-gray-600 tabular-nums mt-1">
          {priceRange(snapshot)} · {snapshot.stationCount} brand
          {snapshot.stationCount === 1 ? '' : 's'}
        </p>

        {delta !== null && !isStale && (
          <p
            className={`mt-1.5 text-[11px] tabular-nums font-medium ${
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
            </span>{' '}
            ₱{Math.abs(delta).toFixed(2)} vs last week
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center justify-between gap-2 px-4 h-11 border-t border-gray-100 text-sm text-left text-primary-700 hover:bg-primary-50/60 rounded-b-lg"
      >
        <span className="truncate">
          <span className="font-medium">{prettyBrand(cheapest.station)}</span>{' '}
          <span className="tabular-nums text-gray-600">
            {peso(cheapest.priceMin)}
          </span>{' '}
          <span className="text-xs text-gray-500">cheapest</span>
        </span>
        <ChevronRight
          className={`h-4 w-4 flex-shrink-0 text-gray-400 transition-transform ${
            open ? 'rotate-90' : ''
          }`}
        />
      </button>

      {open && (
        <dl className="px-4 pb-4 pt-3 border-t border-gray-100 space-y-1.5">
          {sortedBrands.map((b) => (
            <div
              key={b.station}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <dt className="text-gray-700">{prettyBrand(b.station)}</dt>
              <dd className="tabular-nums text-gray-900 font-medium">
                {priceRange(b)}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </article>
  );
}

export default function FuelPricesSection() {
  const [search, setSearch] = useState('');
  const [fuelFilter, setFuelFilter] = useState('');
  const [weekFilter, setWeekFilter] = useState('');

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
      const matchSearch =
        !search || s.fuelType.toLowerCase().includes(search.toLowerCase());
      const matchFuel = !fuelFilter || s.fuelType === fuelFilter;
      const matchWeek = !weekFilter || s.date === weekFilter;
      return matchSearch && matchFuel && matchWeek;
    });
  }, [search, fuelFilter, weekFilter]);

  return (
    <div className="space-y-4 lg:space-y-6">
      <p className="text-xs text-gray-500">
        Week of{' '}
        <span className="font-medium text-gray-700 tabular-nums">
          {fuelData.stats.latestWeek}
        </span>{' '}
        · {fuelData.stats.stationsSurveyed} brands surveyed ·{' '}
        <a
          href={fuelData.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-primary-700"
        >
          DOE Oil Monitor
        </a>
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {latestCards.map(({ snapshot, prior }) => (
          <FuelCard key={snapshot.id} snapshot={snapshot} prior={prior} />
        ))}
      </div>

      <details className="group border border-gray-200 rounded-lg bg-white open:shadow-sm">
        <summary className="flex items-center justify-between gap-2 px-4 h-11 cursor-pointer list-none text-sm font-medium text-gray-800 rounded-lg hover:bg-gray-50">
          <span>Price trend · {fuelData.stats.weeksTracked} weeks</span>
          <ChevronDown className="h-4 w-4 text-gray-400 transition-transform group-open:rotate-180" />
        </summary>
        <div className="px-3 pb-3">
          {allSnapshots.length > 0 && <FuelPricesChart />}
        </div>
      </details>

      <details className="group border border-gray-200 rounded-lg bg-white">
        <summary className="flex items-center justify-between gap-2 px-4 h-11 cursor-pointer list-none text-sm font-medium text-gray-800 rounded-lg hover:bg-gray-50">
          <span>All weekly snapshots</span>
          <ChevronDown className="h-4 w-4 text-gray-400 transition-transform group-open:rotate-180" />
        </summary>
        <div className="p-3 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                aria-label="Search fuel type"
                placeholder="Search fuel type..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="relative">
              <select
                aria-label="Filter by fuel type"
                value={fuelFilter}
                onChange={(e) => setFuelFilter(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All weeks</option>
                {fuelData.filters.weeks.map((w) => (
                  <option key={w} value={w}>
                    {w}
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
                      Fuel type
                    </th>
                    <th
                      scope="col"
                      className="text-right py-2 px-3 font-medium text-gray-600 hidden sm:table-cell"
                    >
                      Min
                    </th>
                    <th
                      scope="col"
                      className="text-right py-2 px-3 font-medium text-gray-600"
                    >
                      Avg
                    </th>
                    <th
                      scope="col"
                      className="text-right py-2 px-3 font-medium text-gray-600 hidden sm:table-cell"
                    >
                      Max
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
                    return (
                      <tr
                        key={s.id}
                        className={`hover:bg-gray-50 ${stale ? 'text-gray-400' : ''}`}
                      >
                        <td className="py-2 px-3 whitespace-nowrap tabular-nums">
                          {s.date}
                        </td>
                        <td className="py-2 px-3">
                          {s.fuelType}
                          {stale && (
                            <span className="ml-1.5 text-[10px] uppercase tracking-wide text-amber-600">
                              stale
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-right hidden sm:table-cell whitespace-nowrap tabular-nums">
                          {peso(s.priceMin)}
                        </td>
                        <td className="py-2 px-3 text-right font-medium whitespace-nowrap tabular-nums">
                          {peso(s.priceAvg)}
                        </td>
                        <td className="py-2 px-3 text-right hidden sm:table-cell whitespace-nowrap tabular-nums">
                          {peso(s.priceMax)}
                        </td>
                        <td className="py-2 px-3 text-right hidden md:table-cell tabular-nums">
                          {s.stationCount}
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
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

      <details className="text-xs text-gray-600">
        <summary className="cursor-pointer text-primary-700 hover:underline">
          What do RON 91 / 95 / 97 / 100 mean?
        </summary>
        <div className="mt-2 space-y-1 pl-2 border-l-2 border-gray-200">
          <p>
            <span className="font-medium">RON</span> is the octane rating of
            gasoline. Higher RON = better engine performance, higher price.
          </p>
          <p>
            <span className="font-medium">RON 91</span> is regular unleaded,{' '}
            <span className="font-medium">RON 95</span> is premium,{' '}
            <span className="font-medium">RON 97 / 100</span> are super premium.{' '}
            <span className="font-medium">Diesel Plus</span> is premium diesel.
          </p>
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
        • DOE publishes updated prices weekly • Data contributed by{' '}
        <span className="font-medium">@{fuelData.contributor}</span> • Last
        updated <span className="tabular-nums">{fuelData.lastUpdated}</span> •
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
