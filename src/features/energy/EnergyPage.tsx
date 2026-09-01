import {
  ChevronDown,
  ExternalLink,
  Factory,
  Gauge,
  PlugZap,
  Search,
  Zap,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
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
import SEO from '../../components/SEO';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import { Card, CardContent } from '../../components/ui/Card';
import { Heading } from '../../components/ui/Heading';
import Section from '../../components/ui/Section';
import energyData from '../../data/energy/electric-grid.json';
import {
  feederCoverageSource,
  feederGroups,
} from '../../data/energy/feederCoverage';

type Facility = (typeof energyData.generation.facilities)[number];
type EnergyTab = 'feeders' | 'nir';

const MOBILE_FACILITY_BATCH_SIZE = 6;
const FEEDER_AREA_PREVIEW_COUNT = 8;

const feederLines = Array.from(
  new Set(feederGroups.map((group) => group.line)),
);
const feederStats = {
  lines: feederLines.length,
  groups: feederGroups.length,
  feeders: feederGroups.reduce(
    (total, group) => total + group.feeders.length,
    0,
  ),
  areas: feederGroups.reduce(
    (total, group) =>
      total +
      group.feeders.reduce(
        (feederTotal, feeder) => feederTotal + feeder.areas.length,
        0,
      ),
    0,
  ),
};

const getFeederGroupKey = (group: { line: string; name: string }) =>
  `${group.line}-${group.name}`;

const energyTabs: Array<{
  id: EnergyTab;
  label: string;
  helper: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    id: 'feeders',
    label: 'Feeder Coverage',
    helper: `${feederStats.feeders} feeders`,
    icon: PlugZap,
  },
  {
    id: 'nir',
    label: 'NIR Generation',
    helper: `${energyData.stats.nirFacilities} facilities`,
    icon: Factory,
  },
];

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
  name: 'Visayas Demand, NIR Generation, and Feeder Coverage Context',
  description:
    'BetterBacolod summary of DOE Visayas system peak demand, NIR power plant capacity data, and Negros Power feeder area coverage.',
  creator: [
    {
      '@type': 'GovernmentOrganization',
      name: energyData.source.name,
      url: 'https://doe.gov.ph',
    },
    {
      '@type': 'Organization',
      name: 'Negros Power',
      url: 'https://negrospower.ph',
    },
  ],
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
    feederCoverageSource.url,
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

function EnergyTabs({
  activeTab,
  onChange,
}: {
  activeTab: EnergyTab;
  onChange: (tab: EnergyTab) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Energy data sections"
      className="mb-6 grid grid-cols-2 gap-1 rounded-lg border border-gray-200 bg-white p-1 shadow-sm sm:mb-8 sm:inline-grid sm:min-w-[420px]"
    >
      {energyTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`energy-tab-${tab.id}`}
            aria-selected={isActive}
            aria-controls={`energy-panel-${tab.id}`}
            onClick={() => onChange(tab.id)}
            className={`flex min-h-14 items-center gap-2 rounded-md px-3 py-2 text-left transition focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
              isActive
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-950'
            }`}
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${
                isActive ? 'bg-white/15' : 'bg-gray-100'
              }`}
            >
              <Icon className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">
                {tab.label}
              </span>
              <span
                className={`block truncate text-xs ${
                  isActive ? 'text-primary-50' : 'text-gray-500'
                }`}
              >
                {tab.helper}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

function FeederAreaList({ areas }: { areas: string[] }) {
  const visibleAreas = areas.slice(0, FEEDER_AREA_PREVIEW_COUNT);
  const hiddenAreas = areas.slice(FEEDER_AREA_PREVIEW_COUNT);

  return (
    <div className="mt-3">
      <div className="flex flex-wrap gap-1.5">
        {visibleAreas.map((area) => (
          <span
            key={area}
            className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700"
          >
            {area}
          </span>
        ))}
      </div>
      {hiddenAreas.length > 0 && (
        <details className="mt-2 group">
          <summary className="cursor-pointer list-none text-xs font-medium text-primary-700 hover:underline">
            Show {hiddenAreas.length} more area
            {hiddenAreas.length === 1 ? '' : 's'}
          </summary>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {hiddenAreas.map((area) => (
              <span
                key={area}
                className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700"
              >
                {area}
              </span>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

function FeederCoverageSection() {
  const [line, setLine] = useState('');
  const [groupName, setGroupName] = useState('');
  const [query, setQuery] = useState('');
  const [openGroupKeys, setOpenGroupKeys] = useState<string[]>([
    getFeederGroupKey(feederGroups[0]),
  ]);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredGroups = useMemo(() => {
    return feederGroups
      .filter((group) => !line || group.line === line)
      .filter((group) => !groupName || group.name === groupName)
      .map((group) => {
        const groupSearchTarget = [
          group.line,
          group.name,
          group.shortName,
          group.capacity,
        ]
          .join(' ')
          .toLowerCase();
        const feeders = group.feeders.filter((feeder) => {
          if (!normalizedQuery) {
            return true;
          }
          const searchTarget = [groupSearchTarget, feeder.code, ...feeder.areas]
            .join(' ')
            .toLowerCase();
          return searchTarget.includes(normalizedQuery);
        });
        return { ...group, feeders };
      })
      .filter((group) => group.feeders.length > 0);
  }, [line, groupName, normalizedQuery]);

  const filteredFeederCount = filteredGroups.reduce(
    (total, group) => total + group.feeders.length,
    0,
  );
  const filteredAreaCount = filteredGroups.reduce(
    (total, group) =>
      total +
      group.feeders.reduce(
        (feederTotal, feeder) => feederTotal + feeder.areas.length,
        0,
      ),
    0,
  );
  const hasFilters = Boolean(line || groupName || normalizedQuery);
  const resetFilters = () => {
    setLine('');
    setGroupName('');
    setQuery('');
    setOpenGroupKeys([getFeederGroupKey(feederGroups[0])]);
  };
  const selectGroup = (selectedGroupName: string) => {
    setGroupName(selectedGroupName);
    const selectedGroup = feederGroups.find(
      (group) => group.name === selectedGroupName,
    );
    if (selectedGroup) {
      setLine('');
      setOpenGroupKeys([getFeederGroupKey(selectedGroup)]);
    }
  };
  const toggleGroup = (groupKey: string) => {
    setOpenGroupKeys((currentKeys) =>
      currentKeys.includes(groupKey)
        ? currentKeys.filter((key) => key !== groupKey)
        : [...currentKeys, groupKey],
    );
  };

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex max-w-3xl gap-3">
          <div className="mt-1 hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-700 sm:flex">
            <PlugZap className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary-700">
              Feeder Area Coverage
            </p>
            <h2 className="mt-1 text-xl font-bold text-gray-950 sm:text-2xl">
              Find which feeder covers a Bacolod-area barangay
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Searchable list from Negros Power feeder coverage. A map can come
              later; this version keeps the areas scannable by line, feeder
              group, and feeder code.
            </p>
          </div>
        </div>
        <a
          href={feederCoverageSource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary-700 hover:underline"
        >
          {feederCoverageSource.name}
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
          <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
            Lines
          </p>
          <p className="text-base font-semibold text-gray-950 tabular-nums">
            {feederStats.lines}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
          <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
            Groups
          </p>
          <p className="text-base font-semibold text-gray-950 tabular-nums">
            {filteredGroups.length}/{feederStats.groups}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
          <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
            Feeders
          </p>
          <p className="text-base font-semibold text-gray-950 tabular-nums">
            {filteredFeederCount}/{feederStats.feeders}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
          <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
            Area entries
          </p>
          <p className="text-base font-semibold text-gray-950 tabular-nums">
            {filteredAreaCount}/{feederStats.areas}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-2 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
        <label className="relative">
          <span className="sr-only">Search feeder coverage</span>
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search barangay, area, or feeder"
            className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </label>
        <select
          aria-label="Filter by feeder line"
          value={line}
          onChange={(event) => setLine(event.target.value)}
          className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All lines</option>
          {feederLines.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter by feeder group"
          value={groupName}
          onChange={(event) => setGroupName(event.target.value)}
          className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All groups</option>
          {feederGroups.map((group) => (
            <option key={group.name} value={group.name}>
              {group.shortName} - {group.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={resetFilters}
          disabled={!hasFilters}
          className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-primary-700 transition hover:bg-primary-50 disabled:cursor-not-allowed disabled:text-gray-400 disabled:hover:bg-white"
        >
          Reset
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        <button
          type="button"
          onClick={resetFilters}
          className={`rounded-lg border px-3 py-3 text-left transition ${
            hasFilters
              ? 'border-gray-200 bg-white text-gray-700 hover:border-primary-200 hover:bg-primary-50'
              : 'border-primary-200 bg-primary-50 text-primary-800'
          }`}
        >
          <span className="block text-sm font-semibold">All groups</span>
          <span className="mt-0.5 block text-xs text-gray-500">
            {feederStats.feeders} feeders
          </span>
        </button>
        {feederGroups.map((group) => {
          const isSelected = groupName === group.name;

          return (
            <button
              key={getFeederGroupKey(group)}
              type="button"
              onClick={() => selectGroup(group.name)}
              className={`rounded-lg border px-3 py-3 text-left transition ${
                isSelected
                  ? 'border-primary-300 bg-primary-50 text-primary-800'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-primary-200 hover:bg-primary-50'
              }`}
            >
              <span className="block text-sm font-semibold">
                {group.shortName}
              </span>
              <span className="mt-0.5 block truncate text-xs text-gray-500">
                {group.name}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 space-y-3">
        {filteredGroups.length === 0 && (
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">
            No feeder coverage matches the current filters.
          </div>
        )}
        {filteredGroups.map((group) => {
          const groupKey = getFeederGroupKey(group);
          const isOpen =
            Boolean(normalizedQuery) ||
            filteredGroups.length === 1 ||
            openGroupKeys.includes(groupKey);
          const areaCount = group.feeders.reduce(
            (total, feeder) => total + feeder.areas.length,
            0,
          );

          return (
            <article
              key={groupKey}
              className="overflow-hidden rounded-lg border border-gray-200 bg-white"
            >
              <button
                type="button"
                aria-expanded={Boolean(isOpen)}
                onClick={() => toggleGroup(groupKey)}
                className="flex w-full flex-col gap-3 p-4 text-left transition hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    {group.line}
                  </p>
                  <h3 className="mt-1 text-base font-semibold text-gray-950">
                    {group.name} ({group.shortName})
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    {areaCount} area entries across {group.feeders.length}{' '}
                    feeder{group.feeders.length === 1 ? '' : 's'}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <div className="flex flex-wrap gap-2 text-xs font-medium">
                    <span className="rounded-full bg-primary-50 px-2.5 py-1 text-primary-700">
                      {group.capacity}
                    </span>
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-gray-700">
                      {group.feeders.length} feeder
                      {group.feeders.length === 1 ? '' : 's'}
                    </span>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-gray-400 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>
              {isOpen && (
                <div className="divide-y divide-gray-100 border-t border-gray-100">
                  {group.feeders.map((feeder, index) => (
                    <div
                      key={`${group.shortName}-${feeder.code}-${index}`}
                      className="p-4"
                    >
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-8 min-w-12 items-center justify-center rounded-md bg-gray-950 px-2 text-sm font-semibold text-white">
                            {feeder.code}
                          </span>
                          <span className="text-sm font-medium text-gray-950">
                            {feeder.areas.length} covered area
                            {feeder.areas.length === 1 ? '' : 's'}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {group.shortName} feeder
                        </span>
                      </div>
                      <FeederAreaList areas={feeder.areas} />
                    </div>
                  ))}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function FacilityTable() {
  const [province, setProvince] = useState('');
  const [resource, setResource] = useState('');
  const [query, setQuery] = useState('');
  const [mobileVisibleCount, setMobileVisibleCount] = useState(
    MOBILE_FACILITY_BATCH_SIZE,
  );

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
  const mobileFacilities = facilities.slice(0, mobileVisibleCount);
  const hasMoreMobileFacilities = mobileVisibleCount < facilities.length;
  const nextMobileCount = Math.min(
    mobileVisibleCount + MOBILE_FACILITY_BATCH_SIZE,
    facilities.length,
  );
  const hasFilters = Boolean(province || resource || normalizedQuery);
  useEffect(() => {
    setMobileVisibleCount(MOBILE_FACILITY_BATCH_SIZE);
  }, [province, resource, normalizedQuery]);
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
          {mobileFacilities.map((facility) => (
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
          {hasMoreMobileFacilities && (
            <button
              type="button"
              onClick={() => setMobileVisibleCount(nextMobileCount)}
              className="w-full rounded-lg border border-primary-200 bg-primary-50 px-4 py-3 text-sm font-semibold text-primary-700 transition hover:bg-primary-100"
            >
              Show more facilities ({facilities.length - mobileVisibleCount}{' '}
              remaining)
            </button>
          )}
          {facilities.length > MOBILE_FACILITY_BATCH_SIZE &&
            !hasMoreMobileFacilities && (
              <button
                type="button"
                onClick={() =>
                  setMobileVisibleCount(MOBILE_FACILITY_BATCH_SIZE)
                }
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
              >
                Show fewer facilities
              </button>
            )}
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

function NirGenerationSection() {
  return (
    <>
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
    </>
  );
}

export default function Energy() {
  const [activeTab, setActiveTab] = useState<EnergyTab>('feeders');

  return (
    <>
      <SEO
        title="Bacolod Energy, Feeder Coverage, and NIR Power Plants"
        description="Track Visayas grid demand, Negros Island Region power plant capacity, and searchable Negros Power feeder area coverage on BetterBacolod."
        keywords="Bacolod energy, Bacolod feeder coverage, Negros Power feeder, Visayas grid demand, Negros power plants, NIR energy, Bacolod electricity, DOE power statistics"
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
              Bacolod feeder coverage and energy context
            </Heading>
            <p className="mt-3 text-base text-gray-600">
              Search Negros Power feeder area coverage for Bacolod and nearby
              service areas, with DOE Visayas demand and NIR generation data as
              supporting energy context.
            </p>
          </div>

          <EnergyTabs activeTab={activeTab} onChange={setActiveTab} />

          {activeTab === 'feeders' && (
            <div
              id="energy-panel-feeders"
              role="tabpanel"
              aria-labelledby="energy-tab-feeders"
              className="mb-6 sm:mb-8"
            >
              <FeederCoverageSection />
            </div>
          )}

          {activeTab === 'nir' && (
            <div
              id="energy-panel-nir"
              role="tabpanel"
              aria-labelledby="energy-tab-nir"
            >
              <NirGenerationSection />
            </div>
          )}

          <Card>
            <CardContent className="p-4 sm:p-6">
              <h2 className="text-base font-semibold text-gray-950">
                Source and scope
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Data is derived from DOE power statistics and the DOE list of
                existing grid-connected power plants. Feeder area coverage is
                sourced from Negros Power. This page intentionally does not
                claim a Bacolod City power plant; no Bacolod City generation
                facility is identified in the DOE dataset.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                {[
                  ...energyData.source.articles,
                  ...energyData.source.documents,
                  {
                    title: feederCoverageSource.name,
                    url: feederCoverageSource.url,
                  },
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
