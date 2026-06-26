import { ExternalLink, Factory, Gauge, Search, Zap } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import { Card, CardContent } from '../components/ui/Card';
import { Heading } from '../components/ui/Heading';
import Section from '../components/ui/Section';
import energyData from '../data/energy/electric-grid.json';

type Facility = (typeof energyData.generation.facilities)[number];

const resourceColors: Record<string, string> = {
  'Ground Mounted': '#0ea5e9',
  Biomass: '#10b981',
  Geothermal: '#ef4444',
  Diesel: '#f59e0b',
  ROR: '#6366f1',
};

const resourceTickLabels: Record<string, string> = {
  'Ground Mounted': 'Solar',
  Biomass: 'Biomass',
  Geothermal: 'Geo',
  Diesel: 'Diesel',
  ROR: 'Hydro',
};

const formatMw = (value: number) =>
  `${value.toLocaleString('en-US', {
    maximumFractionDigits: value % 1 === 0 ? 0 : 1,
  })} MW`;

const sourceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Dataset',
  name: 'Visayas Demand and NIR Generation Context',
  description:
    'BetterBacolod summary of DOE Visayas system peak demand and NIR power plant capacity data.',
  creator: {
    '@type': 'GovernmentOrganization',
    name: energyData.source.name,
    url: 'https://doe.gov.ph',
  },
  spatialCoverage: [
    { '@type': 'AdministrativeArea', name: 'Visayas, Philippines' },
    { '@type': 'AdministrativeArea', name: 'Negros Island Region' },
  ],
  temporalCoverage: '2001/2025',
  dateModified: energyData.lastUpdated,
  url: 'https://betterbacolod.org/energy',
  isBasedOn: [
    ...energyData.source.articles.map((source) => source.url),
    ...energyData.source.documents.map((source) => source.url),
  ],
};

function MetricCard({
  label,
  value,
  helper,
  icon: Icon,
}: {
  label: string;
  value: string;
  helper: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="h-full">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              {label}
            </p>
            <p className="mt-2 text-xl font-bold text-gray-950 tabular-nums sm:text-2xl">
              {value}
            </p>
            <p className="mt-1 text-sm text-gray-600">{helper}</p>
          </div>
          <div className="rounded-md bg-primary-50 p-2.5 text-primary-700">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DemandChart() {
  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
          <div>
            <h2 className="text-base font-semibold text-gray-950">
              Visayas System Peak Demand
            </h2>
            <p className="text-sm text-gray-500">2001-2025, MW</p>
          </div>
          <span className="text-xs text-gray-500">DOE Power Statistics</span>
        </div>
        <div className="h-[220px] w-full sm:h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={energyData.demand.rows}
              margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e5e7eb"
              />
              <XAxis
                dataKey="year"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 11 }}
                minTickGap={20}
              />
              <YAxis
                tickFormatter={(value: number) => `${value / 1000}k`}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 11 }}
                width={42}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '10px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 8px 24px -8px rgb(0 0 0 / 0.15)',
                  fontSize: '12px',
                }}
                formatter={(value) => [formatMw(Number(value)), 'Demand']}
                labelFormatter={(label) => `${label}`}
              />
              <Line
                type="monotone"
                dataKey="demandMw"
                stroke="#2563eb"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function GenerationChart() {
  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
          <div>
            <h2 className="text-base font-semibold text-gray-950">
              NIR Capacity by Resource
            </h2>
            <p className="text-sm text-gray-500">Installed vs dependable, MW</p>
          </div>
          <span className="text-xs text-gray-500">25 facilities</span>
        </div>
        <div className="h-[240px] w-full sm:h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={energyData.generation.byResourceType}
              margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e5e7eb"
              />
              <XAxis
                dataKey="name"
                tickFormatter={(value: string) =>
                  resourceTickLabels[value] ?? value
                }
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 11 }}
                interval={0}
                minTickGap={10}
              />
              <YAxis
                tickFormatter={(value: number) => `${value}`}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 11 }}
                width={36}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '10px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 8px 24px -8px rgb(0 0 0 / 0.15)',
                  fontSize: '12px',
                }}
                formatter={(value, name) => [
                  formatMw(Number(value)),
                  name === 'installedMw' ? 'Installed' : 'Dependable',
                ]}
              />
              <Legend
                verticalAlign="bottom"
                height={28}
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '11px', paddingTop: 4 }}
                formatter={(value) =>
                  value === 'installedMw' ? 'Installed' : 'Dependable'
                }
              />
              <Bar dataKey="installedMw" fill="#2563eb" radius={[4, 4, 0, 0]} />
              <Bar
                dataKey="dependableMw"
                fill="#14b8a6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function FacilityTable() {
  const [province, setProvince] = useState('');
  const [resource, setResource] = useState('');
  const [query, setQuery] = useState('');

  const provinces = energyData.generation.byProvince.map((item) => item.name);
  const resources = energyData.generation.byResourceType.map(
    (item) => item.name,
  );
  const normalizedQuery = query.trim().toLowerCase();
  const facilities = useMemo(() => {
    return (energyData.generation.facilities as Facility[]).filter(
      (facility) => {
        const matchesProvince = !province || facility.province === province;
        const matchesResource = !resource || facility.resourceType === resource;
        const searchTarget = [
          facility.facilityName,
          facility.officialName,
          facility.cityMunicipality,
          facility.province,
          facility.operator,
        ]
          .join(' ')
          .toLowerCase();
        return (
          matchesProvince &&
          matchesResource &&
          (!normalizedQuery || searchTarget.includes(normalizedQuery))
        );
      },
    );
  }, [province, resource, normalizedQuery]);
  const filteredInstalled = facilities.reduce(
    (total, facility) => total + facility.installedMw,
    0,
  );
  const filteredDependable = facilities.reduce(
    (total, facility) => total + facility.dependableMw,
    0,
  );
  const hasFilters = Boolean(province || resource || normalizedQuery);
  const resetFilters = () => {
    setProvince('');
    setResource('');
    setQuery('');
  };

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-950">
              NIR Generation Facilities
            </h2>
            <p className="text-sm text-gray-500">
              Sorted by installed capacity, DOE May 2026 list.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-3 lg:min-w-[560px]">
            <label className="relative">
              <span className="sr-only">Search facilities</span>
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search plant or city"
                className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </label>
            <select
              aria-label="Filter by province"
              value={province}
              onChange={(event) => setProvince(event.target.value)}
              className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All provinces</option>
              {provinces.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <select
              aria-label="Filter by resource type"
              value={resource}
              onChange={(event) => setResource(event.target.value)}
              className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All resources</option>
              {resources.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
            <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
              Showing
            </p>
            <p className="text-base font-semibold text-gray-950 tabular-nums">
              {facilities.length}/{energyData.stats.nirFacilities}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
            <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
              Installed
            </p>
            <p className="text-base font-semibold text-gray-950 tabular-nums">
              {formatMw(filteredInstalled)}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
            <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
              Dependable
            </p>
            <p className="text-base font-semibold text-gray-950 tabular-nums">
              {formatMw(filteredDependable)}
            </p>
          </div>
          <button
            type="button"
            onClick={resetFilters}
            disabled={!hasFilters}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-left text-sm font-medium text-primary-700 transition hover:bg-primary-50 disabled:cursor-not-allowed disabled:text-gray-400 disabled:hover:bg-white"
          >
            Reset filters
          </button>
        </div>

        <div className="space-y-3 md:hidden">
          {facilities.length === 0 && (
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">
              No NIR facilities match the current filters.
            </div>
          )}
          {facilities.map((facility) => (
            <div
              key={facility.facilityName}
              className="rounded-lg border border-gray-200 bg-white p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-950">
                    {facility.facilityName}
                  </h3>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {facility.cityMunicipality}, {facility.province}
                  </p>
                </div>
                <span
                  className="shrink-0 whitespace-nowrap rounded-full px-2 py-1 text-xs font-medium"
                  style={{
                    color: resourceColors[facility.resourceType] ?? '#374151',
                    backgroundColor: `${
                      resourceColors[facility.resourceType] ?? '#6b7280'
                    }18`,
                  }}
                >
                  {facility.resourceType}
                </span>
              </div>
              <p className="mt-2 line-clamp-2 text-xs text-gray-500">
                {facility.operator || facility.officialName}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-md bg-gray-50 px-3 py-2">
                  <p className="text-[11px] text-gray-500">Installed</p>
                  <p className="font-semibold tabular-nums text-gray-950">
                    {formatMw(facility.installedMw)}
                  </p>
                </div>
                <div className="rounded-md bg-gray-50 px-3 py-2">
                  <p className="text-[11px] text-gray-500">Dependable</p>
                  <p className="font-semibold tabular-nums text-gray-950">
                    {formatMw(facility.dependableMw)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="hidden overflow-x-auto md:block">
          {facilities.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">
              No NIR facilities match the current filters.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-3 py-3">Facility</th>
                  <th className="px-3 py-3">Location</th>
                  <th className="px-3 py-3">Resource</th>
                  <th className="px-3 py-3 text-right">Installed</th>
                  <th className="px-3 py-3 text-right">Dependable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {facilities.map((facility) => (
                  <tr key={facility.facilityName} className="hover:bg-gray-50">
                    <td className="px-3 py-3">
                      <div className="font-medium text-gray-950">
                        {facility.facilityName}
                      </div>
                      <div className="max-w-sm truncate text-xs text-gray-500">
                        {facility.operator || facility.officialName}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-gray-700">
                      {facility.cityMunicipality}, {facility.province}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className="inline-flex whitespace-nowrap rounded-full px-2 py-1 text-xs font-medium"
                        style={{
                          color:
                            resourceColors[facility.resourceType] ?? '#374151',
                          backgroundColor: `${
                            resourceColors[facility.resourceType] ?? '#6b7280'
                          }18`,
                        }}
                      >
                        {facility.resourceType}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right font-medium tabular-nums text-gray-950">
                      {formatMw(facility.installedMw)}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums text-gray-700">
                      {formatMw(facility.dependableMw)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Energy() {
  return (
    <>
      <SEO
        title="Visayas Energy and NIR Power Plants"
        description="Track Visayas grid demand and Negros Island Region power plant capacity using Department of Energy data on BetterBacolod."
        keywords="Bacolod energy, Visayas grid demand, Negros power plants, NIR energy, Bacolod electricity, DOE power statistics"
        url="/energy"
      />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(sourceSchema)}
        </script>
      </Helmet>
      <Section className="bg-gray-50 py-8 sm:py-12" animate={false}>
        <div className="mx-auto max-w-7xl">
          <Breadcrumbs className="mb-6 sm:mb-8" />
          <div className="mb-6 max-w-3xl sm:mb-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary-700">
              Energy
            </p>
            <Heading className="mt-2 text-3xl leading-tight sm:text-4xl lg:text-5xl">
              Visayas grid demand and Negros power plants
            </Heading>
            <p className="mt-3 text-base text-gray-600">
              A compact view of DOE power statistics for Visayas demand and NIR
              generation capacity. Bacolod is shown as part of the wider Visayas
              and Negros grid context.
            </p>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-3 sm:mb-8 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            <MetricCard
              label="Visayas 2025 demand"
              value={formatMw(energyData.stats.visayasDemand2025Mw)}
              helper="System peak demand"
              icon={Zap}
            />
            <MetricCard
              label="Demand growth"
              value={`${energyData.stats.visayasDemandGrowthSince2001Pct}%`}
              helper="Since 2001"
              icon={Gauge}
            />
            <MetricCard
              label="NIR installed"
              value={formatMw(energyData.stats.nirInstalledMw)}
              helper={`${energyData.stats.nirFacilities} facilities`}
              icon={Factory}
            />
            <MetricCard
              label="NIR dependable"
              value={formatMw(energyData.stats.nirDependableMw)}
              helper={`${formatMw(
                energyData.stats.negrosOccidentalInstalledMw,
              )} in Negros Occidental`}
              icon={Factory}
            />
          </div>

          <div className="mb-6 grid gap-4 sm:mb-8 sm:gap-6 lg:grid-cols-2">
            <DemandChart />
            <GenerationChart />
          </div>

          <div className="mb-6 sm:mb-8">
            <FacilityTable />
          </div>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <h2 className="text-base font-semibold text-gray-950">
                Source and scope
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Data is derived from DOE power statistics and the DOE list of
                existing grid-connected power plants. This page intentionally
                does not claim a Bacolod City power plant; no Bacolod City
                generation facility is identified in the dataset.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                {[
                  ...energyData.source.articles,
                  ...energyData.source.documents,
                ].map((source) => (
                  <a
                    key={source.url}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary-700 hover:underline"
                  >
                    {source.title}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </Section>
    </>
  );
}
