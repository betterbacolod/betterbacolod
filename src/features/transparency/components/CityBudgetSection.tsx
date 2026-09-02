import {
  ArrowUpRight,
  Check,
  Download,
  ExternalLink,
  Info,
  Landmark,
  PiggyBank,
  WalletCards,
} from 'lucide-react';
import { type Dispatch, type SetStateAction, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import budgetData from '../../../data/transparency/bacolod-annual-budget.json';

const peso = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 0,
});

const compactPeso = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  notation: 'compact',
  maximumFractionDigits: 1,
});

const formatPeso = (centavos: number) => peso.format(centavos / 100);
const formatCompactPeso = (centavos: number) =>
  compactPeso.format(centavos / 100);

const chartColors = {
  total: '#0066eb',
  local: '#00af5f',
  external: '#3385ef',
  other: '#f58900',
  personnel: '#0066eb',
  maintenance: '#00af5f',
  financial: '#ff4d00',
  capital: '#f58900',
  special: '#0052bc',
};

const fundingSeries = [
  { key: 'local', label: 'Local sources', color: chartColors.local },
  { key: 'external', label: 'External sources', color: chartColors.external },
  { key: 'other', label: 'Other receipts', color: chartColors.other },
] as const;

const expenditureSeries = [
  { key: 'personnel', label: 'Personnel', color: chartColors.personnel },
  { key: 'maintenance', label: 'MOOE', color: chartColors.maintenance },
  { key: 'financial', label: 'Financial', color: chartColors.financial },
  { key: 'capital', label: 'Capital outlay', color: chartColors.capital },
  { key: 'special', label: 'Special purpose', color: chartColors.special },
] as const;

type Report = (typeof budgetData.reports)[number];
type ChartValue = number | string | readonly (number | string)[] | undefined;

const spendingCategoryColors = {
  'Personnel services': chartColors.personnel,
  MOOE: chartColors.maintenance,
  'Financial expenses': chartColors.financial,
  'Capital outlay': chartColors.capital,
  'Special purpose': chartColors.special,
} as const;

const expenseDefinitions = [
  {
    label: 'Personnel services',
    description: 'Salaries, wages, and employee benefits.',
    color: chartColors.personnel,
  },
  {
    label: 'MOOE',
    description:
      'Day-to-day operations: supplies, utilities, travel, repairs, and contracted services.',
    color: chartColors.maintenance,
  },
  {
    label: 'Financial expenses',
    description: 'Interest, bank charges, and other borrowing-related costs.',
    color: chartColors.financial,
  },
  {
    label: 'Capital outlay',
    description:
      'Long-lived assets such as infrastructure, vehicles, and equipment.',
    color: chartColors.capital,
  },
  {
    label: 'Special purpose',
    description:
      'Earmarked funds, including disaster risk reduction and similar purposes.',
    color: chartColors.special,
  },
] as const;

const chartTooltipStyle = {
  borderRadius: '12px',
  border: '1px solid #99c2f7',
  boxShadow: '0 16px 32px -16px rgb(0 61 141 / 0.25)',
  fontSize: '12px',
  padding: '10px 12px',
};

const asNumber = (value: ChartValue) =>
  Number(Array.isArray(value) ? value[0] : (value ?? 0));

function SeriesToggles({
  series,
  hidden,
  onToggle,
}: {
  series: readonly { key: string; label: string; color: string }[];
  hidden: string[];
  onToggle: (key: string) => void;
}) {
  return (
    <div
      role="group"
      className="mt-3 flex flex-wrap gap-2"
      aria-label="Chart series"
    >
      {series.map((item) => {
        const isVisible = !hidden.includes(item.key);
        return (
          <button
            key={item.key}
            type="button"
            aria-pressed={isVisible}
            onClick={() => onToggle(item.key)}
            className={`inline-flex min-h-9 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
              isVisible
                ? 'border-primary-100 bg-white text-primary-800 hover:border-primary-300'
                : 'border-transparent bg-primary-50 text-primary-300 line-through'
            }`}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: isVisible ? item.color : '#99c2f7' }}
              aria-hidden="true"
            />
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof Landmark;
}) {
  return (
    <div className="rounded-2xl border border-primary-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary-700">
            {label}
          </p>
          <p className="mt-1 text-xl font-bold tracking-tight text-primary-900 sm:text-2xl">
            {value}
          </p>
        </div>
        <div className="rounded-xl bg-primary-50 p-2 text-primary-700">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>
      </div>
      <p className="mt-2 text-xs leading-5 text-primary-700">{detail}</p>
    </div>
  );
}

export default function CityBudgetSection() {
  const reports = budgetData.reports as Report[];
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [hiddenFunding, setHiddenFunding] = useState<string[]>([]);
  const [hiddenExpenditures, setHiddenExpenditures] = useState<string[]>([]);
  const selected =
    reports.find((report) => report.year === selectedYear) ?? reports.at(-1);

  const budgetTrend = useMemo(
    () =>
      reports.map((report) => ({
        year: String(report.year),
        total: report.proposedAmountCentavos,
      })),
    [reports],
  );
  const fundingMix = useMemo(
    () =>
      reports.map((report) => {
        const local = report.financing.localSourcesCentavos;
        const external = report.financing.externalSourcesCentavos;
        return {
          year: String(report.year),
          local,
          external,
          other: report.proposedAmountCentavos - local - external,
          total: report.proposedAmountCentavos,
        };
      }),
    [reports],
  );
  const expenditureMix = useMemo(
    () =>
      reports.map((report) => ({
        year: String(report.year),
        personnel: report.expenditures.personnelServicesCentavos,
        maintenance: report.expenditures.maintenanceAndOperatingCentavos,
        financial: report.expenditures.financialExpensesCentavos,
        capital: report.expenditures.propertyPlantAndEquipmentCentavos,
        special: report.expenditures.specialPurposeAppropriationsCentavos,
      })),
    [reports],
  );
  const topSpendingItems = useMemo(
    () =>
      (selected?.topSpendingItems ?? []).map((item) => ({
        ...item,
        color:
          spendingCategoryColors[
            item.category as keyof typeof spendingCategoryColors
          ] ?? chartColors.total,
      })),
    [selected],
  );

  if (!selected) return null;
  const previous = reports.find((report) => report.year === selected.year - 1);
  const yearOverYear = previous
    ? ((selected.proposedAmountCentavos - previous.proposedAmountCentavos) /
        previous.proposedAmountCentavos) *
      100
    : null;

  const selectChartYear = (entry: { payload?: { year?: string } }) => {
    const year = Number(entry.payload?.year);
    if (reports.some((report) => report.year === year)) {
      setSelectedYear((current) => (current === year ? null : year));
    }
  };
  const toggleSeries = (
    key: string,
    allKeys: readonly string[],
    setHidden: Dispatch<SetStateAction<string[]>>,
  ) => {
    setHidden((current) => {
      if (current.includes(key)) return current.filter((item) => item !== key);
      return current.length === allKeys.length - 1
        ? current
        : [...current, key];
    });
  };

  return (
    <div className="-m-4 overflow-hidden bg-primary-50/40 md:-m-6">
      <section className="bg-primary-900 px-5 py-6 text-white sm:px-7 sm:py-8">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-primary-100">
            <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1">
              BACOLOD CITY
            </span>
            <span>Annual Budget Reports · 2022–2025</span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold tracking-tight sm:text-3xl">
              City Budget
            </h3>
            <p className="mt-1 max-w-xl text-sm leading-6 text-primary-100">
              A source-first view of Bacolod’s proposed annual budget—not a
              record of actual spending.
            </p>
          </div>
        </div>
      </section>

      <div className="border-b border-primary-100 bg-white px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary-700">
              Select a report year
            </p>
            <p className="mt-0.5 text-sm font-semibold text-primary-900">
              {selectedYear === null
                ? 'All available reports'
                : `${selected.year} Annual Budget Report`}
            </p>
          </div>
          <div
            role="group"
            aria-label="Select budget year"
            className="grid grid-cols-4 rounded-xl bg-primary-50 p-1 sm:w-auto"
          >
            {reports.map((report) => {
              const isSelected = selectedYear === report.year;
              return (
                <button
                  key={report.year}
                  type="button"
                  onClick={() =>
                    setSelectedYear((current) =>
                      current === report.year ? null : report.year,
                    )
                  }
                  aria-pressed={isSelected}
                  className={`relative inline-flex min-h-11 items-center justify-center rounded-lg px-3 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
                    isSelected
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'text-primary-700 hover:bg-white hover:text-primary-900'
                  }`}
                >
                  {isSelected && (
                    <Check className="absolute left-2.5 h-3.5 w-3.5" />
                  )}
                  {report.year}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="space-y-6 p-4 sm:p-5 md:p-6">
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <MetricCard
            label={
              selectedYear === null
                ? 'Latest proposed budget'
                : `${selected.year} proposed budget`
            }
            value={formatCompactPeso(selected.proposedAmountCentavos)}
            detail={formatPeso(selected.proposedAmountCentavos)}
            icon={WalletCards}
          />
          <MetricCard
            label="Change from prior year"
            value={
              yearOverYear === null
                ? '—'
                : `${yearOverYear >= 0 ? '+' : ''}${yearOverYear.toFixed(1)}%`
            }
            detail={
              previous
                ? `Compared with ${previous.year} proposed budget`
                : 'Earliest available report'
            }
            icon={ArrowUpRight}
          />
          <MetricCard
            label="Planned local sources"
            value={formatCompactPeso(selected.financing.localSourcesCentavos)}
            detail="Tax and non-tax revenue"
            icon={Landmark}
          />
          <MetricCard
            label="External sources"
            value={formatCompactPeso(
              selected.financing.externalSourcesCentavos,
            )}
            detail="Includes National Tax Allotment"
            icon={PiggyBank}
          />
        </div>

        <article className="rounded-2xl border border-primary-100 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary-700">
                Where planned funds go
              </p>
              <h4 className="mt-1 font-semibold text-primary-900">
                Largest planned expense items in {selected.year}
              </h4>
            </div>
            <p className="text-xs text-primary-700">
              Top six individual appropriation lines
            </p>
          </div>
          <div className="mt-4 h-[22rem] text-xs sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={topSpendingItems}
                margin={{ top: 4, right: 16, left: 4, bottom: 0 }}
              >
                <CartesianGrid
                  horizontal={false}
                  stroke="#cce0fb"
                  strokeDasharray="3 3"
                />
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#0052bc', fontSize: 11 }}
                  tickFormatter={(value: number) => formatCompactPeso(value)}
                />
                <YAxis
                  type="category"
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#003d8d', fontSize: 11 }}
                  width={150}
                />
                <Tooltip
                  cursor={false}
                  contentStyle={chartTooltipStyle}
                  labelFormatter={(label) => String(label)}
                  formatter={(value: ChartValue, _name, item) => [
                    formatPeso(asNumber(value)),
                    String(item.payload?.category ?? 'Planned appropriation'),
                  ]}
                />
                <Bar
                  dataKey="amountCentavos"
                  name="Planned appropriation"
                  radius={[0, 6, 6, 0]}
                >
                  {topSpendingItems.map((item) => (
                    <Cell key={item.sourceRow} fill={item.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-3 text-xs leading-5 text-primary-700">
            These are planned expense lines in the Annual Budget Report—not
            departments, completed projects, or actual spending.
          </p>
        </article>

        <div className="grid gap-4 xl:grid-cols-2">
          <article className="rounded-2xl border border-primary-100 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary-700">
                Four-year trend
              </p>
              <h4 className="mt-1 font-semibold text-primary-900">
                Proposed city budget
              </h4>
            </div>
            <div className="h-64 text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={budgetTrend}
                  margin={{ top: 8, right: 4, left: -8, bottom: 0 }}
                >
                  <CartesianGrid
                    vertical={false}
                    stroke="#cce0fb"
                    strokeDasharray="3 3"
                  />
                  <XAxis
                    dataKey="year"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#0052bc', fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#0052bc', fontSize: 11 }}
                    tickFormatter={(value: number) => formatCompactPeso(value)}
                    width={58}
                  />
                  <Tooltip
                    trigger="click"
                    cursor={false}
                    contentStyle={chartTooltipStyle}
                    labelFormatter={(label) => `${label} budget`}
                    formatter={(value: ChartValue) => [
                      formatPeso(asNumber(value)),
                      'Proposed budget',
                    ]}
                  />
                  <Bar
                    dataKey="total"
                    fill={chartColors.total}
                    radius={[8, 8, 2, 2]}
                    maxBarSize={56}
                    onClick={selectChartYear}
                  >
                    {budgetTrend.map((entry) => (
                      <Cell
                        key={entry.year}
                        fill={chartColors.total}
                        cursor="pointer"
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-3 text-xs text-primary-700 lg:hidden">
              Tap a bar to view that year’s budget.
            </p>
          </article>

          <article className="rounded-2xl border border-primary-100 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary-700">
                Financing mix
              </p>
              <h4 className="mt-1 font-semibold text-primary-900">
                Where planned funds come from
              </h4>
            </div>
            <div className="h-64 text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={fundingMix}
                  margin={{ top: 8, right: 4, left: -8, bottom: 0 }}
                >
                  <CartesianGrid
                    vertical={false}
                    stroke="#cce0fb"
                    strokeDasharray="3 3"
                  />
                  <XAxis
                    dataKey="year"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#0052bc', fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#0052bc', fontSize: 11 }}
                    tickFormatter={(value: number) => formatCompactPeso(value)}
                    width={58}
                  />
                  <Tooltip
                    trigger="click"
                    cursor={false}
                    contentStyle={chartTooltipStyle}
                    formatter={(value: ChartValue) =>
                      formatPeso(asNumber(value))
                    }
                  />
                  <Bar
                    dataKey="local"
                    name="Local sources"
                    stackId="funding"
                    fill={chartColors.local}
                    hide={hiddenFunding.includes('local')}
                    onClick={selectChartYear}
                  >
                    {fundingMix.map((entry) => (
                      <Cell
                        key={entry.year}
                        fill={chartColors.local}
                        cursor="pointer"
                      />
                    ))}
                  </Bar>
                  <Bar
                    dataKey="external"
                    name="External sources"
                    stackId="funding"
                    fill={chartColors.external}
                    hide={hiddenFunding.includes('external')}
                    onClick={selectChartYear}
                  >
                    {fundingMix.map((entry) => (
                      <Cell
                        key={entry.year}
                        fill={chartColors.external}
                        cursor="pointer"
                      />
                    ))}
                  </Bar>
                  <Bar
                    dataKey="other"
                    name="Other receipts"
                    stackId="funding"
                    fill={chartColors.other}
                    radius={[6, 6, 0, 0]}
                    hide={hiddenFunding.includes('other')}
                    onClick={selectChartYear}
                  >
                    {fundingMix.map((entry) => (
                      <Cell
                        key={entry.year}
                        fill={chartColors.other}
                        cursor="pointer"
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <SeriesToggles
              series={fundingSeries}
              hidden={hiddenFunding}
              onToggle={(key) =>
                toggleSeries(
                  key,
                  fundingSeries.map((item) => item.key),
                  setHiddenFunding,
                )
              }
            />
          </article>
        </div>

        <article className="rounded-2xl border border-primary-100 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary-700">
                Planned allocation
              </p>
              <h4 className="mt-1 font-semibold text-primary-900">
                How the budget is allocated
              </h4>
            </div>
            <p className="text-xs text-primary-700">
              All values are proposed appropriations.
            </p>
          </div>
          <div className="h-72 text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={expenditureMix}
                margin={{ top: 8, right: 4, left: -8, bottom: 0 }}
              >
                <CartesianGrid
                  vertical={false}
                  stroke="#cce0fb"
                  strokeDasharray="3 3"
                />
                <XAxis
                  dataKey="year"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#0052bc', fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#0052bc', fontSize: 11 }}
                  tickFormatter={(value: number) => formatCompactPeso(value)}
                  width={58}
                />
                <Tooltip
                  trigger="click"
                  cursor={false}
                  contentStyle={chartTooltipStyle}
                  formatter={(value: ChartValue) => formatPeso(asNumber(value))}
                />
                <Bar
                  dataKey="personnel"
                  name="Personnel"
                  stackId="spending"
                  fill={chartColors.personnel}
                  hide={hiddenExpenditures.includes('personnel')}
                  onClick={selectChartYear}
                >
                  {expenditureMix.map((entry) => (
                    <Cell
                      key={entry.year}
                      fill={chartColors.personnel}
                      cursor="pointer"
                    />
                  ))}
                </Bar>
                <Bar
                  dataKey="maintenance"
                  name="MOOE"
                  stackId="spending"
                  fill={chartColors.maintenance}
                  hide={hiddenExpenditures.includes('maintenance')}
                  onClick={selectChartYear}
                >
                  {expenditureMix.map((entry) => (
                    <Cell
                      key={entry.year}
                      fill={chartColors.maintenance}
                      cursor="pointer"
                    />
                  ))}
                </Bar>
                <Bar
                  dataKey="financial"
                  name="Financial"
                  stackId="spending"
                  fill={chartColors.financial}
                  hide={hiddenExpenditures.includes('financial')}
                  onClick={selectChartYear}
                >
                  {expenditureMix.map((entry) => (
                    <Cell
                      key={entry.year}
                      fill={chartColors.financial}
                      cursor="pointer"
                    />
                  ))}
                </Bar>
                <Bar
                  dataKey="capital"
                  name="Capital outlay"
                  stackId="spending"
                  fill={chartColors.capital}
                  hide={hiddenExpenditures.includes('capital')}
                  onClick={selectChartYear}
                >
                  {expenditureMix.map((entry) => (
                    <Cell
                      key={entry.year}
                      fill={chartColors.capital}
                      cursor="pointer"
                    />
                  ))}
                </Bar>
                <Bar
                  dataKey="special"
                  name="Special purpose"
                  stackId="spending"
                  fill={chartColors.special}
                  radius={[6, 6, 0, 0]}
                  hide={hiddenExpenditures.includes('special')}
                  onClick={selectChartYear}
                >
                  {expenditureMix.map((entry) => (
                    <Cell
                      key={entry.year}
                      fill={chartColors.special}
                      cursor="pointer"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <SeriesToggles
            series={expenditureSeries}
            hidden={hiddenExpenditures}
            onToggle={(key) =>
              toggleSeries(
                key,
                expenditureSeries.map((item) => item.key),
                setHiddenExpenditures,
              )
            }
          />
          <div className="mt-5 border-t border-primary-100 pt-4">
            <h5 className="text-sm font-semibold text-primary-900">
              How to read the allocation
            </h5>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
              {expenseDefinitions.map((definition) => (
                <div
                  key={definition.label}
                  className="rounded-xl border border-primary-100 bg-primary-50/40 p-3"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: definition.color }}
                      aria-hidden="true"
                    />
                    <p className="text-xs font-semibold text-primary-900">
                      {definition.label}
                    </p>
                  </div>
                  <p className="mt-1.5 text-xs leading-5 text-primary-700">
                    {definition.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-3 text-xs text-primary-700 lg:hidden">
            Tap a bar to view that year’s budget.
          </p>
        </article>

        <div className="flex flex-col gap-3 rounded-2xl border border-primary-100 bg-primary-50/60 p-4 text-sm text-primary-950 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <Info
              className="mt-0.5 h-4 w-4 shrink-0 text-primary-700"
              aria-hidden="true"
            />
            <p className="leading-5">
              Figures are taken from the City’s published Annual Budget Reports.
              Use the original workbook for the full line-item record.
            </p>
          </div>
          <div className="grid shrink-0 grid-cols-1 gap-2 sm:flex sm:flex-wrap">
            <a
              href={selected.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center gap-1 rounded-lg bg-primary-700 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary-800"
            >
              Open {selectedYear === null ? 'latest' : selected.year} XLSX{' '}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <a
              href="/data/bacolod-annual-budget-2022-2025.csv"
              download
              className="inline-flex min-h-11 items-center justify-center gap-1 rounded-lg border border-primary-200 bg-white px-3 py-2 text-xs font-semibold text-primary-800 transition-colors hover:bg-primary-100"
            >
              Download CSV <Download className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
        <p className="text-center text-xs text-primary-700">
          Source:{' '}
          <a
            className="underline decoration-primary-300 underline-offset-2 hover:text-primary-900"
            href={budgetData.sourcePage}
            target="_blank"
            rel="noopener noreferrer"
          >
            Bacolod City Full Disclosure Policy
          </a>{' '}
          · Dataset generated from verified worksheet totals.
        </p>
      </div>
    </div>
  );
}
