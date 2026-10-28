import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Filter,
  Info,
  RefreshCw,
  Search,
  Share2,
  X,
} from 'lucide-react';
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../../components/SEO';
import { loadOfficeContext, loadProjects } from './api';
import ComparisonChart from './ComparisonChart';
import DistrictLeaderboard from './DistrictLeaderboard';
import {
  BACOLOD_OFFICE,
  difference,
  type Filters,
  filterProjects,
  GROUPS,
  money,
  type OfficeLens,
  PAGE_SIZE,
  type Project,
  projectsCsv,
  type Snapshot,
  SORTS,
  type SourceNotice,
  safeSourceUrl,
  sortProjects,
  totals,
} from './data';
import {
  nationalProjectsMetadata,
  nationalProjectsStructuredData,
} from './metadata';
import ProjectDetails from './ProjectDetails';
import './national-projects.css';

const control =
  'min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100';
const button =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition-colors hover:border-primary-200 hover:bg-primary-50 focus-visible:outline-primary-500 disabled:cursor-not-allowed disabled:opacity-50';

function Status({ project }: { project: Project }) {
  const review = project.held || project.flags.length > 0;
  return (
    <div className="flex flex-wrap gap-1.5">
      <span
        className={`rounded-md px-2 py-1 text-[11px] font-medium ${project.bridge_group === 'unchanged' ? 'bg-slate-100 text-slate-600' : 'bg-primary-50 text-primary-800'}`}
      >
        {project.status_label}
      </span>
      {review && (
        <span className="rounded-md bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-900">
          Match needs checking
        </span>
      )}
    </div>
  );
}

function OfficeContext({ office }: { office: string }) {
  const [context, setContext] = useState<{
    lens: OfficeLens;
    notices: SourceNotice[];
  } | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    setContext(null);
    setError(false);
    loadOfficeContext(office, controller.signal)
      .then((value) => {
        if (!controller.signal.aborted) setContext(value);
      })
      .catch(() => {
        if (!controller.signal.aborted) setError(true);
      });
    return () => controller.abort();
  }, [office]);
  return (
    <div className="rounded-xl border border-primary-100 bg-primary-50/60 p-4 text-xs leading-5 text-primary-900">
      <p className="font-semibold">
        Implementing-office view, not a city-boundary filter
      </p>
      <p>
        Centrally implemented Bacolod projects may appear elsewhere in the NIR
        results. These project-list sums can differ from BetterGov’s office
        leaderboard because office-change records are treated separately.
      </p>
      {context ? (
        <details className="mt-2">
          <summary className="cursor-pointer font-medium">
            Office attribution and source notes
          </summary>
          <div className="mt-2 space-y-2">
            {context.lens.offices.map((item) => (
              <div key={item.id}>
                <p className="font-semibold">
                  {item.name} · {item.tier_text}
                </p>
                <p>
                  Associated districts:{' '}
                  {item.districts
                    .map((district) => district.label)
                    .join('; ') || 'Not specified'}
                </p>
                {item.office_change && (
                  <p>
                    {item.office_change.rows} office-change records.{' '}
                    {item.office_change.note}
                  </p>
                )}
              </div>
            ))}
            <p>{context.lens.tier_meaning}</p>
            <p>{context.lens.note}</p>
            {context.notices.map((notice) => (
              <p key={notice.id}>
                {notice.body}{' '}
                <a
                  href={safeSourceUrl(notice.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Source notice
                </a>
              </p>
            ))}
            <a
              className="inline-flex min-h-11 items-center gap-1 font-semibold underline"
              target="_blank"
              rel="noopener noreferrer"
              href="https://budget.bettergov.ph/hgab/2027/districts"
            >
              View district totals and unassigned residual on BetterGov{' '}
              <ExternalLink size={12} />
            </a>
          </div>
        </details>
      ) : (
        <p className="mt-2 text-primary-700">
          {error
            ? 'Office attribution context is unavailable. Check the source before interpreting office totals.'
            : 'Loading office attribution notes…'}
        </p>
      )}
    </div>
  );
}

export default function NationalProjectsPage() {
  const [query, setQuery] = useQueryStates(
    {
      q: parseAsString.withDefault(''),
      office: parseAsString.withDefault(''),
      program: parseAsString.withDefault(''),
      group: parseAsString.withDefault(''),
      held: parseAsString.withDefault('all'),
      sort: parseAsString.withDefault('house'),
      page: parseAsInteger.withDefault(1),
      project: parseAsString.withDefault(''),
      view: parseAsString.withDefault('leaderboard'),
      district: parseAsString.withDefault(''),
      area: parseAsString.withDefault(''),
      rank: parseAsString.withDefault('house'),
    },
    { history: 'replace' },
  );
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const request = useRef<AbortController | null>(null);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pushedProject = useRef(false);
  const pushedDistrict = useRef(false);
  const projectNavigation = useRef<Promise<URLSearchParams> | null>(null);
  const districtNavigation = useRef<Promise<URLSearchParams> | null>(null);
  useEffect(() => {
    if (!query.project) pushedProject.current = false;
  }, [query.project]);
  useEffect(() => {
    if (!query.district) pushedDistrict.current = false;
  }, [query.district]);
  const refresh = useCallback(async (force = false) => {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setBusy(true);
    setError('');
    try {
      const next = await loadProjects(controller.signal, force);
      if (!controller.signal.aborted) setSnapshot(next);
    } catch (cause) {
      if (!controller.signal.aborted)
        setError(
          cause instanceof Error && cause.name === 'TimeoutError'
            ? 'The request took too long. Please try again.'
            : cause instanceof TypeError
              ? 'We could not reach BetterGov. Check your connection and try again.'
              : cause instanceof Error
                ? cause.message
                : 'We could not reach BetterGov. Please try again.',
        );
    } finally {
      if (!controller.signal.aborted) setBusy(false);
    }
  }, []);
  useEffect(() => {
    void refresh();
    return () => {
      request.current?.abort();
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
    };
  }, [refresh]);
  const search = useDeferredValue(query.q);
  const filters: Filters = {
    q: search,
    office: query.office,
    program: query.program,
    group: query.group,
    held: query.held,
  };
  const allRows = snapshot?.rows ?? [];
  const filtered = useMemo(
    () => filterProjects(allRows, filters),
    [allRows, search, query.office, query.program, query.group, query.held],
  );
  const sorted = useMemo(
    () => sortProjects(filtered, query.sort),
    [filtered, query.sort],
  );
  const stats = useMemo(() => totals(filtered), [filtered]);
  // Ignore the chart's own dimension when drawing its choices, so a second click clears the selection.
  const officeChartRows = useMemo(
    () => filterProjects(allRows, { ...filters, office: '' }),
    [allRows, search, query.program, query.group, query.held],
  );
  const programChartRows = useMemo(
    () => filterProjects(allRows, { ...filters, program: '' }),
    [allRows, search, query.office, query.group, query.held],
  );
  const options = (key: 'office' | 'program') =>
    [...new Set(allRows.flatMap((row) => (row[key] ? [row[key]] : [])))].sort();
  const pages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const page = Math.max(1, Math.min(query.page, pages));
  const shown = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const updateFilter = (key: keyof Filters, value: string) => {
    void setQuery({ [key]: value, page: 1 });
  };
  const chips = [
    ['q', query.q ? `Search: ${query.q}` : ''],
    ['office', query.office],
    ['program', query.program],
    ['group', GROUPS.find(([key]) => key === query.group)?.[1] ?? query.group],
    [
      'held',
      query.held === 'only'
        ? 'Match needs checking'
        : query.held === 'hide'
          ? 'No review flags'
          : '',
    ],
  ].filter(([, label]) => label);
  const download = () => {
    if (!snapshot) return;
    const blob = new Blob(
      [
        projectsCsv(
          ['projects', 'charts'].includes(query.view) ? sorted : allRows,
          snapshot.meta,
        ),
      ],
      {
        type: 'text/csv;charset=utf-8',
      },
    );
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = 'nir-dpwh-proposals-2027.csv';
    link.click();
    setTimeout(() => URL.revokeObjectURL(href), 1000);
  };
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      copiedTimer.current = setTimeout(() => setCopied(false), 2500);
    } catch {
      setError(
        'Could not copy the link. Copy the address from your browser instead.',
      );
    }
  };
  const openProject = async (id: string) => {
    // Commit pending filter replacements before creating a detail-history entry.
    await setQuery({});
    pushedProject.current = true;
    projectNavigation.current = setQuery({ project: id }, { history: 'push' });
  };
  const closeProject = async () => {
    if (!query.project) return;
    if (pushedProject.current) {
      pushedProject.current = false;
      await projectNavigation.current;
      window.history.back();
    } else void setQuery({ project: '' });
  };
  const selectDistrict = async (district: string) => {
    await setQuery({});
    const mobile = window.matchMedia('(max-width: 1023px)').matches;
    pushedDistrict.current = mobile;
    districtNavigation.current = setQuery(
      { district },
      { history: mobile ? 'push' : 'replace' },
    );
  };
  const closeDistrict = async () => {
    if (!query.district) return;
    if (pushedDistrict.current) {
      pushedDistrict.current = false;
      await districtNavigation.current;
      window.history.back();
    } else void setQuery({ district: '' });
  };

  return (
    <>
      <SEO
        {...nationalProjectsMetadata}
        structuredData={nationalProjectsStructuredData}
      />
      <main className="national-projects min-h-screen bg-slate-50/80 pb-12">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 pb-3 pt-2 sm:px-6 sm:pb-6 sm:pt-5">
            <Link
              to="/transparency"
              className="inline-flex min-h-11 items-center gap-2 text-sm text-slate-500 hover:text-primary-700"
            >
              <ArrowLeft size={15} />
              Transparency
            </Link>
            <div className="mt-1 flex flex-col justify-between gap-3 lg:flex-row lg:items-end">
              <div className="max-w-2xl">
                <div className="flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-widest">
                  <span className="rounded-md bg-primary-50 px-2 py-1 text-primary-700">
                    Proposed FY2027
                  </span>
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-600">
                    DPWH · Negros Island Region
                  </span>
                </div>
                <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                  What’s proposed for your district?
                </h1>
                <p className="mt-3 hidden text-sm leading-6 text-slate-600 lg:block sm:text-base">
                  Compare proposed funding for NIR districts and explore the
                  projects with the biggest amounts.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" className={button} onClick={copyLink}>
                  {copied ? <Check size={15} /> : <Share2 size={15} />}
                  {copied ? 'Link copied' : 'Copy link'}
                </button>
                <button
                  type="button"
                  className={button}
                  disabled={!snapshot || busy}
                  onClick={download}
                >
                  <ArrowDownToLine size={15} />
                  Export projects
                </button>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-3 border-t border-slate-100 pt-1 text-[11px] text-slate-500 sm:mt-5 sm:pt-3 sm:text-xs">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-600" />
                Live from BetterGov
              </span>
              {snapshot && (
                <>
                  <span>
                    Source built{' '}
                    {new Date(snapshot.meta.built_at).toLocaleDateString(
                      'en-PH',
                      { month: 'short', day: 'numeric', year: 'numeric' },
                    )}
                  </span>
                  <span className="hidden sm:inline">
                    Loaded{' '}
                    {new Date(snapshot.loadedAt).toLocaleTimeString('en-PH', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </span>
                </>
              )}
              <button
                type="button"
                onClick={() => void refresh(true)}
                disabled={busy}
                className="inline-flex min-h-11 items-center gap-1.5 font-medium text-primary-700 disabled:opacity-50"
              >
                <RefreshCw
                  size={13}
                  className={busy ? 'motion-safe:animate-spin' : ''}
                />
                {busy ? 'Loading…' : 'Refresh'}
              </button>
            </div>
          </div>
        </header>
        <div className="mx-auto max-w-7xl space-y-5 px-4 pt-6 sm:px-6">
          {error && (
            <div
              role="alert"
              className="flex flex-col justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 sm:flex-row sm:items-center"
            >
              <div>
                <p className="font-semibold">
                  {snapshot
                    ? 'Showing the previous successful load'
                    : 'The live source is unavailable'}
                </p>
                <p className="mt-1">{error}</p>
              </div>
              <button
                type="button"
                className={button}
                onClick={() => void refresh(true)}
                disabled={busy}
              >
                Retry
              </button>
            </div>
          )}
          {!snapshot ? (
            busy ? (
              <div
                role="status"
                aria-label="Loading national project data"
                className="space-y-5"
              >
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  {['NEP', 'House', 'Difference', 'Records'].map((name) => (
                    <div
                      key={name}
                      className="h-28 rounded-xl border border-slate-200 bg-white p-4"
                    >
                      <div className="h-3 w-20 rounded bg-slate-100 motion-safe:animate-pulse" />
                      <div className="mt-4 h-6 w-28 max-w-full rounded bg-slate-100 motion-safe:animate-pulse" />
                    </div>
                  ))}
                </div>
                <div className="h-96 rounded-2xl border border-slate-200 bg-white" />
              </div>
            ) : (
              <p className="py-14 text-center text-sm text-slate-500">
                Use Retry to load the source data.
              </p>
            )
          ) : (
            <>
              <div
                role="group"
                aria-label="Explorer view"
                className="national-view-tabs inline-flex max-w-full gap-1 rounded-xl border border-slate-200 bg-white p-1"
              >
                {(
                  [
                    ['leaderboard', 'District leaderboard'],
                    ['projects', 'All projects'],
                    ['charts', 'Charts'],
                  ] as const
                ).map(([view, label]) => (
                  <button
                    key={view}
                    type="button"
                    aria-pressed={
                      query.view === view ||
                      (view === 'leaderboard' &&
                        !['projects', 'charts'].includes(query.view))
                    }
                    onClick={() => void setQuery({ view })}
                    className={`min-h-11 rounded-lg px-3 text-xs font-semibold transition-colors sm:px-4 sm:text-sm ${query.view === view || (view === 'leaderboard' && !['projects', 'charts'].includes(query.view)) ? 'bg-primary-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {!['projects', 'charts'].includes(query.view) ? (
                <DistrictLeaderboard
                  rows={allRows}
                  revision={snapshot.meta.source_commit}
                  loadedAt={snapshot.loadedAt}
                  selectedId={query.district}
                  area={query.area}
                  sort={query.rank}
                  onArea={(area) => void setQuery({ area })}
                  onSort={(rank) => void setQuery({ rank })}
                  onSelect={selectDistrict}
                  onClose={closeDistrict}
                  onProject={openProject}
                  onBrowse={(office) =>
                    void setQuery({
                      view: 'projects',
                      office,
                      q: '',
                      program: '',
                      group: '',
                      held: 'all',
                      page: 1,
                    })
                  }
                />
              ) : (
                <>
                  <div
                    className="flex flex-wrap items-center gap-2"
                    role="group"
                    aria-label="Project scope"
                  >
                    <button
                      type="button"
                      aria-pressed={!query.office}
                      onClick={() => updateFilter('office', '')}
                      className={`${button} ${!query.office ? '!border-primary-600 !bg-primary-600 !text-white' : ''}`}
                    >
                      All NIR offices
                    </button>
                    <button
                      type="button"
                      aria-pressed={query.office === BACOLOD_OFFICE}
                      onClick={() =>
                        updateFilter(
                          'office',
                          query.office === BACOLOD_OFFICE ? '' : BACOLOD_OFFICE,
                        )
                      }
                      className={`${button} ${query.office === BACOLOD_OFFICE ? '!border-primary-600 !bg-primary-600 !text-white' : ''}`}
                    >
                      Bacolod City office
                    </button>
                    <span className="text-xs text-slate-500">
                      FY2027 national proposals · separate from the city’s
                      annual budget
                    </span>
                  </div>
                  {query.view === 'charts' && (
                    <section
                      aria-label="Filtered proposal totals"
                      className="grid grid-cols-2 gap-3 lg:grid-cols-4"
                    >
                      {[
                        [
                          'Executive proposal',
                          money(stats.nep, true),
                          `${stats.nepCount.toLocaleString()} NEP records`,
                          'text-primary-800',
                        ],
                        [
                          'House proposal',
                          money(stats.house, true),
                          `${stats.houseCount.toLocaleString()} House records`,
                          'text-teal-700',
                        ],
                        [
                          'Difference',
                          difference(stats.house - stats.nep),
                          'House minus Executive proposal',
                          'text-slate-900',
                        ],
                        [
                          'Comparison records',
                          filtered.length.toLocaleString(),
                          `${stats.uncertain} carry review flags`,
                          'text-slate-900',
                        ],
                      ].map(([label, value, detail, color]) => (
                        <div
                          key={label}
                          className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5"
                        >
                          <p className="text-xs font-medium text-slate-500">
                            {label}
                          </p>
                          <p
                            className={`mt-2 text-2xl font-bold tracking-tight tabular-nums sm:text-3xl ${color}`}
                          >
                            {value}
                          </p>
                          <p className="mt-2 text-[11px] leading-4 text-slate-500">
                            {detail}
                          </p>
                        </div>
                      ))}
                    </section>
                  )}
                  <details className="rounded-xl border border-slate-200 bg-white px-4 text-xs leading-5 text-slate-600">
                    <summary className="flex min-h-11 cursor-pointer items-center gap-2 font-medium text-slate-700">
                      <Info size={14} />
                      How to read these figures
                      <ChevronDown size={13} className="ml-auto" />
                    </summary>
                    <div className="space-y-2 pb-4">
                      <p>
                        <strong>NEP:</strong> the President’s proposed budget.
                        <strong> House:</strong> the House of Representatives’
                        version of the budget, printed as House Bill 10858 for
                        third reading. It is not yet law. Compare these
                        versions; do not add them together.
                      </p>
                      <p>
                        These are proposed amounts. They do not show money
                        already spent. “Not listed” means a matching project was
                        not found in that version. Some matches still need
                        checking against the original documents.
                      </p>
                      <p>
                        Search matches project names and offices. A road named
                        “Bacolod” can pass through another city; search results
                        are not geographic city totals.
                      </p>
                    </div>
                  </details>
                  <section
                    aria-label="Project filters"
                    className="rounded-2xl border border-slate-200 bg-white p-4"
                  >
                    <label className="relative block">
                      <span className="sr-only">
                        Search projects, offices, and programs
                      </span>
                      <Search
                        size={17}
                        className="pointer-events-none absolute left-3.5 top-3.5 text-slate-400"
                      />
                      <input
                        type="search"
                        value={query.q}
                        onChange={(event) =>
                          updateFilter('q', event.target.value)
                        }
                        placeholder="Search a road, drainage project, office…"
                        className={`${control} !pl-10`}
                      />
                    </label>
                    <details className="mt-3 lg:hidden">
                      <summary className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
                        <Filter size={15} />
                        Filters {chips.length > 0 ? `(${chips.length})` : ''}
                        <ChevronDown size={13} />
                      </summary>
                      <div className="grid gap-3 pt-2 sm:grid-cols-2">
                        {renderFilters()}
                      </div>
                    </details>
                    <div className="mt-3 hidden grid-cols-4 gap-3 lg:grid">
                      {renderFilters()}
                    </div>
                    {chips.length > 0 && (
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {chips.map(([key, label]) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() =>
                              updateFilter(
                                key as keyof Filters,
                                key === 'held' ? 'all' : '',
                              )
                            }
                            className="inline-flex min-h-11 max-w-full items-center gap-2 rounded-lg bg-primary-50 px-3 text-left text-xs text-primary-800"
                            aria-label={`Remove ${label} filter`}
                          >
                            <span className="break-words">{label}</span>
                            <X size={12} className="shrink-0" />
                          </button>
                        ))}
                        <button
                          type="button"
                          className="min-h-11 px-2 text-xs font-semibold text-slate-500 hover:text-primary-700"
                          onClick={() =>
                            void setQuery({
                              q: '',
                              office: '',
                              program: '',
                              group: '',
                              held: 'all',
                              sort: 'house',
                              page: 1,
                            })
                          }
                        >
                          Reset filters
                        </button>
                      </div>
                    )}
                  </section>
                  {query.view === 'charts' ? (
                    <>
                      <div className="grid items-start gap-4 xl:grid-cols-2">
                        <ComparisonChart
                          rows={officeChartRows}
                          field="office"
                          selected={query.office}
                          onSelect={(value) => updateFilter('office', value)}
                        />
                        <ComparisonChart
                          rows={programChartRows}
                          field="program"
                          selected={query.program}
                          onSelect={(value) => updateFilter('program', value)}
                        />
                      </div>
                      <p className="text-xs text-slate-500">
                        Each chart keeps its own choices visible. The other
                        filters apply. Summary cards reflect every active
                        filter. Switch to All projects to read the matching
                        records.
                      </p>
                    </>
                  ) : (
                    <section
                      aria-labelledby="project-results"
                      className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                    >
                      <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:p-5">
                        <div>
                          <h2
                            id="project-results"
                            className="font-semibold text-slate-900"
                          >
                            Explore the project records
                          </h2>
                          <p
                            role="status"
                            className="mt-1 text-xs text-slate-500"
                          >
                            {filtered.length.toLocaleString()} of{' '}
                            {allRows.length.toLocaleString()} comparison records
                            {busy ? ' · refreshing source…' : ''}
                          </p>
                        </div>
                        <label className="flex items-center gap-2 text-xs text-slate-500">
                          <span className="shrink-0">Sort by</span>
                          <select
                            className={control}
                            value={query.sort}
                            onChange={(event) =>
                              void setQuery({
                                sort: event.target.value,
                                page: 1,
                              })
                            }
                          >
                            {SORTS.map(([key, label]) => (
                              <option key={key} value={key}>
                                {label}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                      {shown.length === 0 ? (
                        <div className="px-4 py-16 text-center">
                          <Search
                            size={24}
                            className="mx-auto text-slate-300"
                          />
                          <h3 className="mt-3 font-semibold text-slate-800">
                            No matching project records
                          </h3>
                          <p className="mt-1 text-sm text-slate-500">
                            Try a shorter search or remove a filter.
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className="hidden overflow-x-auto md:block">
                            <table className="w-full text-left text-sm">
                              <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                                <tr>
                                  <th className="px-5 py-3 font-medium">
                                    Project / implementing office
                                  </th>
                                  <th className="whitespace-nowrap px-4 py-3 text-right font-medium">
                                    <button
                                      type="button"
                                      className="min-h-11"
                                      onClick={() =>
                                        void setQuery({ sort: 'nep', page: 1 })
                                      }
                                    >
                                      NEP proposal ↓
                                    </button>
                                  </th>
                                  <th className="whitespace-nowrap px-4 py-3 text-right font-medium">
                                    <button
                                      type="button"
                                      className="min-h-11"
                                      onClick={() =>
                                        void setQuery({
                                          sort: 'house',
                                          page: 1,
                                        })
                                      }
                                    >
                                      House proposal ↓
                                    </button>
                                  </th>
                                  <th className="px-4 py-3 text-right font-medium">
                                    Difference
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {shown.map((project) => (
                                  <tr
                                    key={project.id}
                                    className="transition-colors hover:bg-slate-50/80"
                                  >
                                    <td className="px-5 py-4">
                                      <button
                                        type="button"
                                        onClick={() => openProject(project.id)}
                                        className="min-h-11 max-w-xl text-left font-semibold leading-5 text-primary-800 hover:underline"
                                      >
                                        {project.title}
                                      </button>
                                      <p className="mb-2 mt-1 text-xs text-slate-500">
                                        {project.office ??
                                          'Office not specified'}
                                      </p>
                                      <Status project={project} />
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-4 text-right align-top tabular-nums text-primary-800">
                                      {money(project.nep_php, true)}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-4 text-right align-top tabular-nums text-teal-700">
                                      {money(project.hgab3_php, true)}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-4 text-right align-top text-xs tabular-nums text-slate-500">
                                      {project.nep_php === null ||
                                      project.hgab3_php === null
                                        ? '—'
                                        : difference(
                                            project.hgab3_php - project.nep_php,
                                          )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <div className="divide-y divide-slate-100 md:hidden">
                            {shown.map((project) => (
                              <article key={project.id} className="p-4">
                                <button
                                  type="button"
                                  onClick={() => openProject(project.id)}
                                  className="min-h-11 text-left text-sm font-semibold leading-6 text-primary-800"
                                >
                                  {project.title}
                                  <ArrowUpRight
                                    size={13}
                                    className="ml-1 inline-block"
                                  />
                                </button>
                                <p className="mb-3 mt-1 text-xs text-slate-500">
                                  {project.office ?? 'Office not specified'}
                                </p>
                                <div className="mb-3 grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3 text-xs">
                                  <p className="text-slate-500">
                                    NEP
                                    <span className="mt-1 block font-semibold tabular-nums text-primary-800">
                                      {money(project.nep_php, true)}
                                    </span>
                                  </p>
                                  <p className="text-slate-500">
                                    House
                                    <span className="mt-1 block font-semibold tabular-nums text-teal-700">
                                      {money(project.hgab3_php, true)}
                                    </span>
                                  </p>
                                </div>
                                <Status project={project} />
                              </article>
                            ))}
                          </div>
                        </>
                      )}
                      <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
                        <span>
                          Page {page} of {pages}
                        </span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            aria-label="Previous results page"
                            className={button}
                            disabled={page === 1}
                            onClick={() => void setQuery({ page: page - 1 })}
                          >
                            <ChevronLeft size={15} />
                            <span className="hidden sm:inline">Previous</span>
                          </button>
                          <button
                            type="button"
                            aria-label="Next results page"
                            className={button}
                            disabled={page === pages}
                            onClick={() => void setQuery({ page: page + 1 })}
                          >
                            <span className="hidden sm:inline">Next</span>
                            <ChevronRight size={15} />
                          </button>
                        </div>
                      </div>
                    </section>
                  )}
                  {query.office && <OfficeContext office={query.office} />}
                </>
              )}
              <footer className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 text-xs leading-5 text-slate-500">
                <p>
                  Source:{' '}
                  <a
                    className="font-medium text-primary-700 underline"
                    href="https://budget.bettergov.ph/hgab/2027/sources"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    BetterGov Budget · source documents and methodology
                  </a>
                  . Amounts are in Philippine pesos.
                </p>
                <details>
                  <summary className="cursor-pointer font-medium text-slate-600">
                    Provenance and comparison limitations
                  </summary>
                  <div className="mt-2 space-y-3">
                    <p>{snapshot.meta.notice}</p>
                    {snapshot.disclaimers.map((notice) => (
                      <p key={notice.id}>
                        {notice.body}{' '}
                        <a
                          className="underline"
                          href={safeSourceUrl(notice.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Read source notice
                        </a>
                      </p>
                    ))}
                    <p className="break-all font-mono text-[10px]">
                      Source revision: {snapshot.meta.source_commit}
                    </p>
                    <p>
                      No automatic polling. Refresh fetches the latest published
                      API response; revisits reuse a successful load for up to
                      five minutes.
                    </p>
                  </div>
                </details>
              </footer>
              <ProjectDetails
                project={allRows.find((row) => row.id === query.project)}
                requested={query.project}
                onClose={closeProject}
              />
            </>
          )}
        </div>
      </main>
    </>
  );

  function renderFilters() {
    return (
      <>
        <label className="text-xs text-slate-500">
          Implementing office
          <select
            className={`${control} mt-1`}
            value={query.office}
            onChange={(event) => updateFilter('office', event.target.value)}
          >
            <option value="">All NIR offices</option>
            {options('office').map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-slate-500">
          Program
          <select
            className={`${control} mt-1`}
            value={query.program}
            onChange={(event) => updateFilter('program', event.target.value)}
          >
            <option value="">All programs</option>
            {options('program').map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-slate-500">
          Comparison
          <select
            className={`${control} mt-1`}
            value={query.group}
            onChange={(event) => updateFilter('group', event.target.value)}
          >
            <option value="">All comparison groups</option>
            {GROUPS.map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-slate-500">
          Match certainty
          <select
            className={`${control} mt-1`}
            value={query.held}
            onChange={(event) => updateFilter('held', event.target.value)}
          >
            <option value="all">Include all records</option>
            <option value="only">Matches that need checking</option>
            <option value="hide">No review flags</option>
          </select>
        </label>
      </>
    );
  }
}
