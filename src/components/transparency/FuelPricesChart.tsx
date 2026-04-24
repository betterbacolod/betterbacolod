import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import fuelData from '../../data/transparency/fuel-prices.json';

export const FUEL_COLORS: Record<string, string> = {
  'Gasoline RON 91': '#0ea5e9',
  'Gasoline RON 95': '#10b981',
  'Gasoline RON 97': '#f59e0b',
  'Gasoline RON 100': '#ef4444',
  Diesel: '#6366f1',
  'Diesel Plus': '#a855f7',
  Kerosene: '#ec4899',
};

type Snapshot = (typeof fuelData.snapshots)[number];

const monthNames = [
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
const formatWeekLabel = (isoDate: string) => {
  const [, m, d] = isoDate.split('-');
  return `${monthNames[Number(m) - 1]} ${Number(d)}`;
};

export default function FuelPricesChart() {
  const fuelTypes = fuelData.filters.fuelTypes;
  const weeks = [...fuelData.filters.weeks].reverse();

  const trendData = weeks.map((week) => {
    const row: Record<string, number | string> = {
      week,
      label: formatWeekLabel(week),
    };
    for (const type of fuelTypes) {
      const snap = fuelData.snapshots.find(
        (s: Snapshot) => s.date === week && s.fuelType === type,
      );
      if (snap) row[type] = snap.priceAvg;
    }
    return row;
  });

  return (
    <div className="relative bg-gradient-to-br from-white via-white to-primary-50/30 p-4 sm:p-5 rounded-xl border border-gray-200 shadow-sm">
      <div className="h-[260px] sm:h-[320px] w-full text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={trendData}
            margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
          >
            <defs>
              {fuelTypes.map((type) => {
                const id = `grad-${type.replace(/\s+/g, '-')}`;
                return (
                  <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor={FUEL_COLORS[type] ?? '#6b7280'}
                      stopOpacity={0.2}
                    />
                    <stop
                      offset="100%"
                      stopColor={FUEL_COLORS[type] ?? '#6b7280'}
                      stopOpacity={0}
                    />
                  </linearGradient>
                );
              })}
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e5e7eb"
            />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 11 }}
              dy={6}
              interval="preserveStartEnd"
              minTickGap={24}
            />
            <YAxis
              domain={['dataMin - 2', 'dataMax + 2']}
              tickFormatter={(value: number) => `₱${value.toFixed(0)}`}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 11 }}
              width={44}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '10px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 8px 24px -8px rgb(0 0 0 / 0.15)',
                fontSize: '12px',
              }}
              labelStyle={{ fontWeight: 600, marginBottom: 2 }}
              formatter={(value, name) => [
                `₱${Number(value ?? 0).toFixed(2)}`,
                String(name),
              ]}
            />
            <Legend
              verticalAlign="bottom"
              height={32}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '11px', paddingTop: 4 }}
            />
            {fuelTypes.map((type) => {
              const color = FUEL_COLORS[type] ?? '#6b7280';
              const id = `grad-${type.replace(/\s+/g, '-')}`;
              return (
                <Area
                  key={type}
                  type="monotone"
                  dataKey={type}
                  stroke={color}
                  strokeWidth={2}
                  fill={`url(#${id})`}
                  fillOpacity={1}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
                />
              );
            })}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
