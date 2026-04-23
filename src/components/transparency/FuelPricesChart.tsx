import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import fuelData from '../../data/transparency/fuel-prices.json';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A855F7'];

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

  const latestWeek = fuelData.stats.latestWeek;
  const latestBreakdown = fuelTypes.map((type) => {
    const snap = fuelData.snapshots.find(
      (s: Snapshot) => s.date === latestWeek && s.fuelType === type,
    );
    return {
      name: type.replace('Gasoline RON ', 'RON '),
      min: snap?.priceMin ?? 0,
      avg: snap?.priceAvg ?? 0,
      max: snap?.priceMax ?? 0,
    };
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-sm font-bold text-gray-800 mb-1">Price trend</h3>
        <p className="text-xs text-gray-500 mb-4">
          Weekly average by fuel type (₱/L)
        </p>
        <div className="h-[250px] w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f3f4f6"
              />
              <XAxis
                dataKey="week"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280' }}
                dy={8}
              />
              <YAxis
                domain={['dataMin - 1', 'dataMax + 1']}
                tickFormatter={(value: number) => `₱${value.toFixed(0)}`}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280' }}
                width={40}
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
                height={36}
                iconType="circle"
                wrapperStyle={{ fontSize: '11px' }}
              />
              {fuelTypes.map((type, index) => (
                <Line
                  key={type}
                  type="monotone"
                  dataKey={type}
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-sm font-bold text-gray-800 mb-1">Latest week</h3>
        <p className="text-xs text-gray-500 mb-4">
          Min, average, and max per fuel type — week of {latestWeek}
        </p>
        <div className="h-[250px] w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={latestBreakdown}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f3f4f6"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 10 }}
                dy={8}
              />
              <YAxis
                tickFormatter={(value: number) => `₱${value.toFixed(0)}`}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280' }}
                width={40}
              />
              <Tooltip
                cursor={{ fill: '#f9fafb' }}
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
                height={36}
                iconType="circle"
                wrapperStyle={{ fontSize: '11px' }}
              />
              <Bar dataKey="min" radius={[4, 4, 0, 0]}>
                {latestBreakdown.map((entry) => (
                  <Cell key={`min-${entry.name}`} fill={COLORS[0]} />
                ))}
              </Bar>
              <Bar dataKey="avg" radius={[4, 4, 0, 0]}>
                {latestBreakdown.map((entry) => (
                  <Cell key={`avg-${entry.name}`} fill={COLORS[1]} />
                ))}
              </Bar>
              <Bar dataKey="max" radius={[4, 4, 0, 0]}>
                {latestBreakdown.map((entry) => (
                  <Cell key={`max-${entry.name}`} fill={COLORS[3]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
