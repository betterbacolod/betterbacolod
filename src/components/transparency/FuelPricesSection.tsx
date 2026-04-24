import { ChevronDown, ExternalLink, Info, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import fuelData from '../../data/transparency/fuel-prices.json';
import FuelPricesChart from './FuelPricesChart';

type Snapshot = (typeof fuelData.snapshots)[number];
type BrandPrice = { station: string; priceMin: number; priceMax: number };

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
        .map((w) => w[0] + w.slice(1).toLowerCase())
        .join(' ');

export default function FuelPricesSection() {
  const [search, setSearch] = useState('');
  const [fuelFilter, setFuelFilter] = useState('');
  const [weekFilter, setWeekFilter] = useState('');

  const filtered = useMemo(() => {
    return fuelData.snapshots.filter((s: Snapshot) => {
      const matchSearch =
        !search || s.fuelType.toLowerCase().includes(search.toLowerCase());
      const matchFuel = !fuelFilter || s.fuelType === fuelFilter;
      const matchWeek = !weekFilter || s.date === weekFilter;
      return matchSearch && matchFuel && matchWeek;
    });
  }, [search, fuelFilter, weekFilter]);

  const headline = useMemo(() => {
    const latest = fuelData.snapshots.filter(
      (s) => s.date === fuelData.stats.latestWeek,
    );
    if (latest.length === 0) return null;

    const priorWeek = fuelData.filters.weeks
      .filter((w) => w < fuelData.stats.latestWeek)
      .sort()
      .at(-1);
    const prior = priorWeek
      ? fuelData.snapshots.filter((s) => s.date === priorWeek)
      : [];

    const sortedByPrice = [...latest].sort((a, b) => a.priceAvg - b.priceAvg);
    const cheapest = sortedByPrice[0];
    const priciest = sortedByPrice[sortedByPrice.length - 1];

    const sharedTypes = new Set(
      latest
        .map((s) => s.fuelType)
        .filter((t) => prior.some((p) => p.fuelType === t)),
    );
    const latestShared = latest.filter((s) => sharedTypes.has(s.fuelType));
    const priorShared = prior.filter((s) => sharedTypes.has(s.fuelType));
    const weeklyChange =
      priorShared.length > 0
        ? latestShared.reduce((sum, s) => sum + s.priceAvg, 0) /
            latestShared.length -
          priorShared.reduce((sum, s) => sum + s.priceAvg, 0) /
            priorShared.length
        : 0;

    return { cheapest, priciest, weeklyChange };
  }, []);

  const latestByBrand = useMemo(() => {
    const latest = fuelData.snapshots.filter(
      (s) => s.date === fuelData.stats.latestWeek,
    );
    const fuelTypes = latest.map((s) => s.fuelType);
    const brandSet = new Set<string>();
    const matrix: Record<string, Record<string, BrandPrice>> = {};
    for (const snap of latest) {
      for (const b of snap.byStation as BrandPrice[]) {
        brandSet.add(b.station);
        if (!matrix[b.station]) matrix[b.station] = {};
        matrix[b.station][snap.fuelType] = b;
      }
    }
    const BRAND_PRIORITY = ['SHELL', 'PETRON', 'CALTEX', 'TOTAL', 'SEAOIL'];
    const brands = [...brandSet].sort((a, b) => {
      const ai = BRAND_PRIORITY.indexOf(a);
      const bi = BRAND_PRIORITY.indexOf(b);
      if (ai !== -1 && bi !== -1) return ai - bi;
      if (ai !== -1) return -1;
      if (bi !== -1) return 1;
      return a.localeCompare(b);
    });
    return { brands, fuelTypes, matrix };
  }, []);

  return (
    <div className="space-y-4">
      {fuelData.placeholder && (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
          <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <p>
            Placeholder figures while we finalize the DOE data feed with{' '}
            <span className="font-medium">@Shiro_Oni</span>. Do not rely on
            these for actual prices.
          </p>
        </div>
      )}

      {headline && (
        <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
          <div className="bg-primary-50 rounded-lg p-2 sm:p-3">
            <p className="text-xs text-primary-600">Cheapest</p>
            <p className="text-lg sm:text-xl font-bold text-primary-700">
              {peso(headline.cheapest.priceAvg)}
            </p>
            <p className="text-[10px] text-primary-600/80 truncate">
              {headline.cheapest.fuelType}
            </p>
          </div>
          <div className="bg-primary-50 rounded-lg p-2 sm:p-3">
            <p className="text-xs text-primary-600">Priciest</p>
            <p className="text-lg sm:text-xl font-bold text-primary-700">
              {peso(headline.priciest.priceAvg)}
            </p>
            <p className="text-[10px] text-primary-600/80 truncate">
              {headline.priciest.fuelType}
            </p>
          </div>
          <div className="bg-primary-50 rounded-lg p-2 sm:p-3">
            <p className="text-xs text-primary-600">Weekly change</p>
            <p
              className={`text-lg sm:text-xl font-bold ${
                headline.weeklyChange > 0
                  ? 'text-rose-600'
                  : headline.weeklyChange < 0
                    ? 'text-emerald-600'
                    : 'text-primary-700'
              }`}
            >
              <span aria-hidden="true">
                {headline.weeklyChange > 0
                  ? '▲'
                  : headline.weeklyChange < 0
                    ? '▼'
                    : '■'}
              </span>
              <span className="sr-only">
                {headline.weeklyChange > 0
                  ? 'Increased by '
                  : headline.weeklyChange < 0
                    ? 'Decreased by '
                    : 'Unchanged at '}
              </span>{' '}
              ₱{Math.abs(headline.weeklyChange).toFixed(2)}
            </p>
            <p className="text-[10px] text-primary-600/80">vs prior week</p>
          </div>
        </div>
      )}

      <div className="flex items-start gap-2 bg-primary-50 border border-primary-100 rounded-lg p-3 text-xs text-primary-800">
        <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
        <p>
          <span className="font-medium">Fuel grade guide:</span> RON is the
          octane rating. <span className="font-medium">RON 91</span> = regular
          unleaded, <span className="font-medium">RON 95</span> = premium,{' '}
          <span className="font-medium">RON 97 / 100</span> = super premium.{' '}
          <span className="font-medium">Diesel Plus</span> is premium diesel.
        </p>
      </div>

      {fuelData.snapshots.length > 0 && <FuelPricesChart />}

      {latestByBrand.brands.length > 0 && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">
              Latest week by brand
            </h3>
            <p className="text-xs text-gray-500">
              Price range per brand for the week of {fuelData.stats.latestWeek}.
              Source: DOE survey.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table
              className="w-full text-sm"
              aria-label="Latest week fuel prices by brand"
            >
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="text-left py-2 px-3 font-medium text-gray-600 whitespace-nowrap"
                  >
                    Brand
                  </th>
                  {latestByBrand.fuelTypes.map((t) => (
                    <th
                      key={t}
                      scope="col"
                      className="text-right py-2 px-3 font-medium text-gray-600 whitespace-nowrap"
                    >
                      {t.replace('Gasoline ', '')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {latestByBrand.brands.map((brand) => (
                  <tr key={brand} className="hover:bg-gray-50">
                    <td className="py-2 px-3 font-medium text-gray-900 whitespace-nowrap">
                      {prettyBrand(brand)}
                    </td>
                    {latestByBrand.fuelTypes.map((t) => {
                      const cell = latestByBrand.matrix[brand]?.[t];
                      return (
                        <td
                          key={t}
                          className="py-2 px-3 text-right text-gray-700 whitespace-nowrap"
                        >
                          {cell ? priceRange(cell) : '—'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
                  Stations
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="py-2 px-3 text-gray-900 whitespace-nowrap">
                    {s.date}
                  </td>
                  <td className="py-2 px-3 text-gray-700">{s.fuelType}</td>
                  <td className="py-2 px-3 text-right text-gray-700 hidden sm:table-cell whitespace-nowrap">
                    {peso(s.priceMin)}
                  </td>
                  <td className="py-2 px-3 text-right text-gray-900 font-medium whitespace-nowrap">
                    {peso(s.priceAvg)}
                  </td>
                  <td className="py-2 px-3 text-right text-gray-700 hidden sm:table-cell whitespace-nowrap">
                    {peso(s.priceMax)}
                  </td>
                  <td className="py-2 px-3 text-right text-gray-600 hidden md:table-cell">
                    {s.stationCount}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    No snapshots for this fuel type in the selected range
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-2">
        <a
          href={fuelData.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-600 text-white rounded text-sm hover:bg-primary-700"
        >
          DOE Oil Monitor <ExternalLink className="h-3 w-3" />
        </a>
      </div>

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
        updated {fuelData.lastUpdated} • Report issues:{' '}
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
