import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import floodData from '../../data/transparency/flood-control.json';

// Define theme colors (matches your Tailwind config)
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function FloodControlChart() {
  // 1. Prepare Bar Chart Data (Budget per Year)
  const barData = floodData.filters.years
    .map((year) => {
      const total = floodData.projects
        .filter((p) => p.year === year)
        .reduce((sum, p) => sum + p.cost, 0);
      return {
        year: year.toString(),
        cost: total,
        label: `₱${(total / 1e6).toFixed(1)}M`,
      };
    })
    .reverse();

  // 2. Prepare Pie Chart Data (Projects by Type)
  const pieDataMap = floodData.projects.reduce(
    (acc, curr) => {
      acc[curr.type] = (acc[curr.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const pieData = Object.keys(pieDataMap).map((key) => ({
    name: key,
    value: pieDataMap[key],
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
      {/* Chart 1: Budget Trend */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-sm font-bold text-gray-800 mb-1">
          Annual Budget Allocation
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          Total flood control spending per year
        </p>
        <div className="h-[250px] w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f3f4f6"
              />
              <XAxis
                dataKey="year"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280' }}
                dy={10}
              />
              <YAxis
                tickFormatter={(value) => `₱${value / 1e6}M`}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280' }}
              />
              <Tooltip
                cursor={{ fill: '#f9fafb' }}
                contentStyle={{
                  borderRadius: '8px',
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
                formatter={(value: number) => [
                  `₱${(value / 1e6).toFixed(2)}M`,
                  'Budget',
                ]}
              />
              <Bar dataKey="cost" radius={[4, 4, 0, 0]} barSize={40}>
                {barData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Project Composition */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-sm font-bold text-gray-800 mb-1">
          Project Distribution
        </h3>
        <p className="text-xs text-gray-500 mb-4">Breakdown by project type</p>
        <div className="h-[250px] w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
