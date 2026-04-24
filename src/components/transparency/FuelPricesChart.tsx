import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import fuelData from '../../data/transparency/fuel-prices.json';

const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#A855F7',
  '#EC4899',
  '#14B8A6',
];

type Snapshot = (typeof fuelData.snapshots)[number];

export default function FuelPricesChart() {
  const fuelTypes = fuelData.filters.fuelTypes;
  const weeks = [...fuelData.filters.weeks].reverse();

  const trendData = weeks.map((week) => {
    const row: Record<string, number | string> = { week: week.slice(5) };
    for (const type of fuelTypes) {
      const snap = fuelData.snapshots.find(
        (s: Snapshot) => s.date === week && s.fuelType === type,
      );
      if (snap) row[type] = snap.priceAvg;
    }
    return row;
  });

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <div className="h-[260px] w-full text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={trendData}
            margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f3f4f6"
            />
            <XAxis
              dataKey="week"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 11 }}
              dy={6}
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
                borderRadius: '8px',
                border: 'none',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                fontSize: '12px',
              }}
              formatter={(value) => [`₱${Number(value ?? 0).toFixed(2)}`, '']}
            />
            <Legend
              verticalAlign="bottom"
              height={32}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '11px' }}
            />
            {fuelTypes.map((type, index) => (
              <Line
                key={type}
                type="monotone"
                dataKey={type}
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
