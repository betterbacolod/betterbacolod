import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { groupProjects, money, type Project } from './data';

export const NEP_COLOR = '#003d8d';
export const HOUSE_COLOR = '#008c78';

export default function ComparisonChart({
  rows,
  field,
  selected,
  onSelect,
}: {
  rows: Project[];
  field: 'office' | 'program';
  selected: string;
  onSelect: (value: string) => void;
}) {
  const groups = groupProjects(rows, field);
  const toggle = (value: string) => onSelect(selected === value ? '' : value);
  const title = field === 'office' ? 'By implementing office' : 'By program';
  return (
    <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-semibold text-slate-900">{title}</h2>
        <span className="text-xs text-slate-500">Tap a bar to filter</span>
      </div>
      <div className="mb-3 flex flex-wrap gap-4 text-xs text-slate-600">
        <span className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-sm"
            style={{ background: NEP_COLOR }}
          />
          Executive proposal
        </span>
        <span className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-sm"
            style={{ background: HOUSE_COLOR }}
          />
          House proposal
        </span>
      </div>
      {groups.length > 0 ? (
        <div style={{ height: Math.max(240, groups.length * 48 + 35) }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={groups}
              layout="vertical"
              margin={{ top: 0, bottom: 0, right: 8, left: 0 }}
            >
              <CartesianGrid
                horizontal={false}
                stroke="#e2e8f0"
                strokeDasharray="3 3"
              />
              <XAxis
                type="number"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickFormatter={(value: number) => money(value, true)}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={118}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#475569' }}
                tickFormatter={(value: string) =>
                  value
                    .replace('District Engineering Office', 'DEO')
                    .replace('Negros Occidental', 'Neg. Occ.')
                    .replace('Negros Oriental', 'Neg. Or.')
                    .replace('Program', '')
                    .trim()
                }
              />
              <Tooltip
                cursor={false}
                formatter={(value) => money(Number(value))}
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid #e2e8f0',
                  fontSize: 12,
                  maxWidth: 280,
                }}
              />
              <Bar
                dataKey="nep"
                name="Executive proposal"
                fill={NEP_COLOR}
                radius={[0, 3, 3, 0]}
                maxBarSize={12}
                isAnimationActive={false}
                cursor="pointer"
                onClick={(entry) => toggle(String(entry.payload.name))}
              />
              <Bar
                dataKey="house"
                name="House proposal"
                fill={HOUSE_COLOR}
                radius={[0, 3, 3, 0]}
                maxBarSize={12}
                isAnimationActive={false}
                cursor="pointer"
                onClick={(entry) => toggle(String(entry.payload.name))}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="py-12 text-center text-sm text-slate-500">
          No matching records to compare.
        </p>
      )}
      <details className="mt-3 border-t border-slate-100 pt-3">
        <summary className="cursor-pointer text-xs font-medium text-primary-700">
          Chart values and keyboard filters
        </summary>
        <ul className="mt-2 space-y-1">
          {groups.map((group) => (
            <li key={group.name}>
              <button
                type="button"
                aria-pressed={selected === group.name}
                onClick={() => toggle(group.name)}
                className="flex min-h-11 w-full items-center justify-between gap-3 rounded-lg px-2 py-2 text-left text-xs hover:bg-primary-50 focus-visible:outline-primary-500"
              >
                <span>{group.name}</span>
                <span className="shrink-0 tabular-nums">
                  {money(group.nep, true)} / {money(group.house, true)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </details>
    </article>
  );
}
