import { NavLink } from 'react-router-dom';

export default function BudgetViews() {
  return (
    <nav
      aria-label="2027 budget views"
      className="my-3 grid max-w-lg grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1"
    >
      {[
        ['DPWH projects', '/transparency/national-projects'],
        ['Department budgets', '/transparency/department-budgets'],
      ].map(([label, to]) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex min-h-11 items-center justify-center rounded-lg px-3 text-center text-sm font-semibold transition-colors focus-visible:outline-primary-600 ${isActive ? 'bg-white text-primary-800 shadow-sm' : 'text-slate-600 hover:bg-white/70'}`
          }
        >
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
