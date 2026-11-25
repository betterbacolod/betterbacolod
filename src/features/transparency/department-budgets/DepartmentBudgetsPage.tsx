import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  ExternalLink,
  Search,
} from 'lucide-react';
import { parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../../components/SEO';
import BudgetViews from '../components/BudgetViews';
import { loadDepartmentBudgets } from './api';
import BudgetDetails, { Amounts } from './BudgetDetails';
import {
  type BudgetSnapshot,
  DBM_NEP,
  DEPARTMENTS,
  detailSearch,
  displayLabel,
  EXPLORER_PAGE,
  entryTitle,
  filterEntries,
  localEntries,
  money,
  SCOPE_NAMES,
  SCOPES,
  scopeForDepartment,
  sumEntries,
} from './data';
import {
  departmentBudgetsMetadata,
  departmentBudgetsStructuredData,
} from './metadata';

const departmentIds = DEPARTMENTS.map((department) => department.id);
const field =
  'min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-base text-slate-800 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100';
const date = (value: string) =>
  new Date(value).toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'Asia/Manila',
  });

export default function DepartmentBudgetsPage() {
  const [query, setQuery] = useQueryStates(
    {
      department: parseAsStringLiteral(departmentIds).withDefault(
        'department-of-education',
      ),
      area: parseAsStringLiteral(SCOPES).withDefault('bacolod'),
      q: parseAsString.withDefault(''),
    },
    { history: 'replace' },
  );
  const [snapshot, setSnapshot] = useState<BudgetSnapshot | null>(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setError('');
    loadDepartmentBudgets(controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) setSnapshot(result);
      })
      .catch((cause) => {
        if (!controller.signal.aborted)
          setError(
            cause instanceof Error
              ? cause.message
              : 'Could not load the saved budget data.',
          );
      });
    return () => controller.abort();
  }, [attempt]);

  useEffect(() => {
    setPage(1);
    setExpanded(null);
  }, [query.department, query.area, query.q]);

  const department = snapshot?.departments.find(
    (item) => item.id === query.department,
  );
  const info = DEPARTMENTS.find((item) => item.id === query.department)!;
  const entries = useMemo(
    () => (department ? localEntries(department, query.area) : []),
    [department, query.area],
  );
  const filtered = useMemo(
    () => filterEntries(entries, query.q),
    [entries, query.q],
  );
  const shown = filtered.slice(0, page * 12);
  const national = query.area === 'national';
  const nep = department
    ? national
      ? department.nep
      : sumEntries(entries, 'nep')
    : 0;
  const house = department
    ? national
      ? department.house
      : sumEntries(entries, 'house')
    : 0;

  return (
    <>
      <SEO
        {...departmentBudgetsMetadata}
        structuredData={departmentBudgetsStructuredData(snapshot)}
      />
      <main className="min-h-screen bg-slate-50 pb-12">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6">
            <Link
              to="/transparency"
              className="inline-flex min-h-11 items-center gap-2 text-sm text-slate-500 hover:text-primary-700"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              Transparency
            </Link>
            <BudgetViews />
            <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-primary-700">
              <BookOpen size={17} aria-hidden="true" />
              Proposed FY2027
            </div>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Where would department funding go?
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              Explore education, health, and social welfare budgets. Start with
              Bacolod, look across NIR, or check the national picture.
            </p>
            <p className="mt-3 text-sm font-medium text-slate-700">
              Budget proposals—not money already spent.
            </p>
            {snapshot && (
              <p className="mt-4 text-sm text-slate-500">
                Saved snapshot · Source built {date(snapshot.builtAt)} ·
                Retrieved {date(snapshot.retrievedAt)}
              </p>
            )}
          </div>
        </header>

        <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
          <section
            aria-label="Choose department and area"
            className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5"
          >
            <div
              role="group"
              className="grid grid-cols-3 gap-2 sm:gap-3"
              aria-label="Department"
            >
              {DEPARTMENTS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={query.department === item.id}
                  disabled={!snapshot}
                  onClick={() => {
                    const next = snapshot?.departments.find(
                      (department) => department.id === item.id,
                    );
                    if (!next) return;
                    void setQuery({
                      department: item.id,
                      area: scopeForDepartment(next, query.area),
                      q: '',
                    });
                  }}
                  className={`min-h-20 rounded-xl border px-2 py-3 text-left transition-colors focus-visible:outline-primary-600 disabled:cursor-wait disabled:opacity-60 sm:px-4 ${query.department === item.id ? 'border-primary-600 bg-primary-50 ring-1 ring-primary-600' : 'border-slate-200 hover:border-primary-300'}`}
                >
                  <span
                    className={`block text-base font-bold ${query.department === item.id ? 'text-primary-800' : 'text-slate-800'}`}
                  >
                    {item.short}
                  </span>
                  <span className="mt-1 block text-sm text-slate-600">
                    {item.name}
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div>
                <label
                  className="block text-sm font-medium text-slate-700"
                  htmlFor="budget-area"
                >
                  Area
                </label>
                <span className="relative mt-2 block">
                  <select
                    id="budget-area"
                    className={`${field} appearance-none pr-10`}
                    value={query.area}
                    onChange={(event) =>
                      void setQuery({
                        area: event.target.value as typeof query.area,
                        q: '',
                      })
                    }
                  >
                    {SCOPES.map((area) => (
                      <option key={area} value={area}>
                        {SCOPE_NAMES[area]}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={18}
                    aria-hidden="true"
                    className="pointer-events-none absolute right-3 top-3 text-slate-500"
                  />
                </span>
              </div>
              <div>
                <label
                  className="block text-sm font-medium text-slate-700"
                  htmlFor="budget-search"
                >
                  Find a program, office, or school
                </label>
                <span className="relative mt-2 block">
                  <Search
                    size={17}
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-3.5 text-slate-400"
                  />
                  <input
                    id="budget-search"
                    type="search"
                    className={`${field} pl-10`}
                    value={query.q}
                    placeholder="Try elementary or a school name"
                    onChange={(event) =>
                      void setQuery({ q: event.target.value })
                    }
                  />
                </span>
              </div>
            </div>
          </section>

          <aside className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
            <strong>Under citizen review.</strong> BetterGov extracted and
            matched these records by computer. Check the source PDFs before
            quoting an amount. This snapshot compares the Executive’s National
            Expenditure Program (NEP) with the House bill’s third-reading
            version, not a final 2027 budget.
          </aside>

          {!snapshot && !error && (
            <div
              role="status"
              className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-600"
            >
              Loading saved department budgets…
            </div>
          )}
          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-white p-5"
            >
              <p className="text-red-800">{error}</p>
              <button
                type="button"
                onClick={() => setAttempt((value) => value + 1)}
                className="mt-3 min-h-11 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700"
              >
                Try again
              </button>
              <a
                href={EXPLORER_PAGE}
                className="ml-4 inline-flex min-h-11 items-center text-sm text-primary-700 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Open BetterGov instead
              </a>
            </div>
          )}

          {department && (
            <>
              <section aria-labelledby="department-scope" className="space-y-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wider text-primary-700">
                    {info.short} · {SCOPE_NAMES[query.area]}
                  </p>
                  <h2
                    id="department-scope"
                    className="mt-2 text-2xl font-bold text-slate-900"
                  >
                    {national
                      ? 'National department comparison'
                      : 'What is identified in the source?'}
                  </h2>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                    {national
                      ? 'New appropriations for the agencies listed under this department. These are nationwide amounts, not Bacolod or NIR funding.'
                      : query.area === 'bacolod'
                        ? 'DepEd division-office entries labelled “Division of Bacolod City” within NIR. This is not the city’s complete education budget or every national program serving Bacolod.'
                        : 'Entries explicitly grouped under “Negros Island Region (NIR).” These are regional amounts—not separate allocations to Bacolod.'}
                  </p>
                </div>
                {entries.length > 0 && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-white p-5">
                      <p className="text-sm text-slate-600">
                        Executive proposal ·{' '}
                        {national ? 'new appropriations' : 'identified entries'}
                      </p>
                      <p
                        className="mt-2 text-3xl font-bold tabular-nums text-slate-900"
                        title={money(nep)}
                      >
                        {money(nep, true)}
                      </p>
                      <p className="mt-2 text-sm tabular-nums text-slate-500">
                        {money(nep)}
                      </p>
                    </div>
                    <div className="rounded-xl border border-primary-200 bg-primary-50/50 p-5">
                      <p className="text-sm text-primary-900">
                        House bill ·{' '}
                        {national ? 'new appropriations' : 'identified entries'}
                      </p>
                      <p
                        className="mt-2 text-3xl font-bold tabular-nums text-primary-900"
                        title={money(house)}
                      >
                        {money(house, true)}
                      </p>
                      <p className="mt-2 text-sm tabular-nums text-primary-700">
                        {money(house)}
                      </p>
                    </div>
                  </div>
                )}
                {entries.length > 0 && !national && (
                  <p className="text-sm leading-6 text-slate-500">
                    Each activity is counted once at the selected region or
                    division boundary. School and office breakdowns are
                    included, not extra. Headline amounts cover all identified
                    entries and do not change with search.
                  </p>
                )}
                {national && (
                  <details className="rounded-xl border border-slate-200 bg-white p-4">
                    <summary className="min-h-11 cursor-pointer text-sm font-semibold text-slate-700">
                      Why can DBM’s national total be different?
                    </summary>
                    <div className="mt-2 space-y-2 text-sm leading-6 text-slate-600">
                      <p>
                        DBM’s NEP all-funds total:{' '}
                        <strong className="tabular-nums text-slate-900">
                          {money(department.allFunds)}
                        </strong>
                        . This is not the same scope as the House comparison
                        above.
                      </p>
                      <p>
                        It includes {money(department.nep)} in comparable new
                        appropriations, {money(department.automatic)} in
                        automatic appropriations, and{' '}
                        {money(department.elsewhere)} for agencies classified
                        elsewhere in the House bill. Automatic appropriations
                        include items such as retirement and life insurance
                        premiums.
                      </p>
                      <p>
                        Do not add this national total to the local figures.
                        Local entries are part of the national budget.
                      </p>
                    </div>
                  </details>
                )}
              </section>

              <section aria-labelledby="budget-entries">
                <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h2
                      id="budget-entries"
                      className="text-xl font-bold text-slate-900"
                    >
                      {national
                        ? 'Agencies in this comparison'
                        : 'Activities and included details'}
                    </h2>
                    <p role="status" className="mt-1 text-sm text-slate-500">
                      {filtered.length}{' '}
                      {national ? 'agencies' : 'activity entries'}
                      {query.q ? ' matching your search' : ''} · Largest House
                      amounts first
                    </p>
                  </div>
                  <a
                    href={`${EXPLORER_PAGE}/${department.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-primary-700 underline underline-offset-4"
                  >
                    Full department on BetterGov{' '}
                    <ExternalLink size={14} aria-hidden="true" />
                  </a>
                </div>
                {filtered.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6">
                    <h3 className="font-semibold text-slate-800">
                      {entries.length === 0
                        ? 'No separately identified Bacolod entry in this view'
                        : 'No matching entries'}
                    </h3>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                      {entries.length === 0
                        ? 'This does not mean Bacolod receives no funding. The published department data has NIR allocations, but this view has no Bacolod division identifier. We do not divide regional amounts into guessed city shares.'
                        : 'Try a different activity or school name. Search does not change the scope totals above.'}
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        void setQuery(
                          entries.length === 0
                            ? { area: 'nir', q: '' }
                            : { q: '' },
                        )
                      }
                      className="mt-4 min-h-11 rounded-lg bg-primary-700 px-4 text-sm font-semibold text-white hover:bg-primary-800"
                    >
                      {entries.length === 0
                        ? 'View NIR allocations'
                        : 'Clear search'}
                    </button>
                  </div>
                ) : (
                  <div className="grid items-start gap-4 lg:grid-cols-2">
                    {shown.map((entry) => {
                      const open = expanded === entry.id;
                      return (
                        <article
                          key={entry.id}
                          className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 sm:p-5"
                        >
                          <p className="text-sm text-slate-500">
                            {displayLabel(entry.agency)}
                          </p>
                          <h3 className="mt-2 break-words text-lg font-semibold leading-6 text-slate-900">
                            {displayLabel(entryTitle(entry))}
                          </h3>
                          {!national && (
                            <p className="mt-2 text-sm text-slate-500">
                              {displayLabel(entry.node.l)}
                            </p>
                          )}
                          <div className="my-4">
                            <Amounts nep={entry.node.n} house={entry.node.h} />
                          </div>
                          {!national && (
                            <>
                              <button
                                type="button"
                                aria-expanded={open}
                                aria-controls={`detail-${entry.id}`}
                                onClick={() =>
                                  setExpanded(open ? null : entry.id)
                                }
                                className="flex min-h-11 w-full items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 text-left text-sm font-semibold text-primary-800 hover:bg-primary-50 focus-visible:outline-primary-600"
                              >
                                {open
                                  ? 'Hide breakdown and sources'
                                  : 'Explore breakdown and sources'}
                                <ChevronDown
                                  size={17}
                                  aria-hidden="true"
                                  className={`shrink-0 transition-transform motion-reduce:transition-none ${open ? 'rotate-180' : ''}`}
                                />
                              </button>
                              <div id={`detail-${entry.id}`}>
                                {open && (
                                  <div className="mt-4 space-y-3">
                                    <p className="text-sm leading-6 text-slate-500">
                                      The path in the source:{' '}
                                      {entry.path.map(displayLabel).join(' / ')}
                                      . Expand an office or school for expense
                                      definitions and source-page links.
                                    </p>
                                    <BudgetDetails
                                      key={`${entry.id}-${query.q}`}
                                      node={entry.node}
                                      search={detailSearch(entry, query.q)}
                                      defaultOpen
                                    />
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </article>
                      );
                    })}
                  </div>
                )}
                {shown.length < filtered.length && (
                  <button
                    type="button"
                    onClick={() => setPage((value) => value + 1)}
                    className="mx-auto mt-5 block min-h-11 rounded-lg border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700"
                  >
                    Show more entries ({filtered.length - shown.length}{' '}
                    remaining)
                  </button>
                )}
              </section>
            </>
          )}

          <footer className="border-t border-slate-200 pt-5 text-sm leading-6 text-slate-600">
            <p className="font-semibold text-slate-800">Check the documents</p>
            <p className="mt-1">
              National department budgets, Bacolod’s city budget, and actual
              spending are different records. This page covers the first, with
              local entries only where the source identifies them.
            </p>
            <div className="mt-2 flex flex-wrap gap-x-6">
              <a
                href={DBM_NEP}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-1 text-primary-700 underline"
              >
                Official DBM 2027 NEP{' '}
                <ExternalLink size={13} aria-hidden="true" />
              </a>
              <a
                href="https://budget.bettergov.ph/hgab/2027/sources"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-1 text-primary-700 underline"
              >
                House documents and methodology{' '}
                <ExternalLink size={13} aria-hidden="true" />
              </a>
              <a
                href="/data/department-budgets-2027.json"
                download
                className="inline-flex min-h-11 items-center text-primary-700 underline"
              >
                Download snapshot with source hashes
              </a>
            </div>
          </footer>
        </div>
      </main>
    </>
  );
}
