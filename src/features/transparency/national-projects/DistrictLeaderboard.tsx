import { ArrowRight, RefreshCw, Trophy } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { loadDistricts } from './api';
import DetailSheet from './DetailSheet';
import DistrictSpotlight from './DistrictSpotlight';
import {
  type District,
  type DistrictSnapshot,
  difference,
  districtProjects,
  money,
  type Project,
  sortProjects,
} from './data';

function Portrait({ district }: { district: District }) {
  const portrait = district.representative?.portrait;
  const [failed, setFailed] = useState(false);
  const permitted = portrait?.url.startsWith(
    'https://juris-assets.bettergov.ph/',
  );
  if (!portrait || !permitted || failed)
    return (
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-50 text-lg font-bold text-primary-600"
        aria-hidden="true"
      >
        {district.representative?.name.charAt(0) ?? '?'}
      </div>
    );
  return (
    <img
      src={portrait.url}
      alt=""
      title={`${portrait.attribution} · ${portrait.license}`}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className="h-12 w-12 shrink-0 rounded-full bg-slate-100 object-cover object-top"
    />
  );
}

export default function DistrictLeaderboard({
  rows,
  revision,
  loadedAt,
  selectedId,
  onSelect,
  onClose,
  onProject,
  onBrowse,
  area,
  sort,
  onArea,
  onSort,
}: {
  rows: Project[];
  revision: string;
  loadedAt: number;
  selectedId: string;
  onSelect: (id: string) => void;
  onClose: () => void;
  onProject: (id: string) => void;
  onBrowse: (office: string) => void;
  area: string;
  sort: string;
  onArea: (area: string) => void;
  onSort: (sort: string) => void;
}) {
  const [source, setSource] = useState<DistrictSnapshot | null>(null);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setError('');
    setSource(null);
    loadDistricts(controller.signal, revision)
      .then((data) => {
        if (!controller.signal.aborted) setSource(data);
      })
      .catch((cause) => {
        if (!controller.signal.aborted)
          setError(
            cause instanceof Error
              ? cause.message
              : 'Unable to load district figures.',
          );
      });
    return () => controller.abort();
  }, [revision, loadedAt, retry]);
  const districts = source?.districts ?? [];
  const rankings = useMemo(() => {
    const ranked = [...districts].sort((a, b) => {
      const value = (item: District) =>
        sort === 'change'
          ? item.fy2027_vs_proposal.delta_php
          : item.fy2027_vs_proposal.hgab3_php;
      return (
        (value(b) ?? -Infinity) - (value(a) ?? -Infinity) ||
        a.label.localeCompare(b.label)
      );
    });
    let rank = 1;
    return ranked.map((district, index) => {
      const current =
        sort === 'change'
          ? district.fy2027_vs_proposal.delta_php
          : district.fy2027_vs_proposal.hgab3_php;
      const previous =
        index > 0
          ? sort === 'change'
            ? ranked[index - 1].fy2027_vs_proposal.delta_php
            : ranked[index - 1].fy2027_vs_proposal.hgab3_php
          : null;
      if (index === 0 || current !== previous) rank = index + 1;
      return { district, rank };
    });
  }, [districts, sort]);
  const visible = rankings.filter(
    ({ district }) => !area || district.jurisdiction === area,
  );
  const selected =
    districts.find((district) => district.id === selectedId) ??
    districts.find((district) => district.jurisdiction === 'Bacolod City') ??
    districts[0];
  const projects = selected
    ? sortProjects(districtProjects(rows, selected), 'house').filter(
        (row) => row.hgab3_php !== null,
      )
    : [];
  const top = projects.slice(0, 5);
  const max = Math.max(
    1,
    ...rankings.map(
      ({ district }) => district.fy2027_vs_proposal.hgab3_php ?? 0,
    ),
  );

  if (error)
    return (
      <div
        role="alert"
        className="rounded-2xl border border-amber-200 bg-amber-50 p-5"
      >
        <p className="font-medium text-amber-950">
          The leaderboard could not load
        </p>
        <p className="mt-2 text-sm text-amber-900">{error}</p>
        <button
          type="button"
          onClick={() => setRetry((value) => value + 1)}
          className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary-700"
        >
          <RefreshCw size={14} />
          Try again
        </button>
      </div>
    );
  if (!source)
    return (
      <div
        role="status"
        className="h-96 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 motion-safe:animate-pulse"
      >
        Loading NIR districts and representatives…
      </div>
    );

  return (
    <section className="space-y-5" aria-labelledby="leaderboard-heading">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2 text-primary-700">
            <Trophy size={17} />
            <p className="text-xs font-semibold uppercase tracking-widest">
              NIR district leaderboard
            </p>
          </div>
          <h2
            id="leaderboard-heading"
            className="mt-2 text-xl font-bold text-slate-950 sm:text-2xl"
          >
            How does your district compare?
          </h2>
          <p className="mt-2 hidden max-w-2xl text-sm leading-6 text-slate-600 lg:block">
            Find your representative, compare the proposed funding, and see the
            biggest projects under the serving DPWH office.
          </p>
        </div>
        <span className="shrink-0 text-xs text-slate-500">
          {districts.length} districts · FY2027 House proposal
        </span>
      </div>
      <div className="rounded-xl border border-primary-100 bg-primary-50/70 px-4 py-3 text-xs leading-5 text-primary-900">
        These amounts belong to DPWH offices. Representatives are shown to help
        you find your district.{' '}
        <span className="hidden lg:inline">
          The figures do not show who requested or controls a project.
        </span>
      </div>
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="grid grid-cols-1 gap-3 border-b border-slate-100 p-4 sm:grid-cols-2">
            <label className="text-xs text-slate-500">
              Area
              <select
                value={area}
                onChange={(event) => {
                  onArea(event.target.value);
                }}
                className="mt-1 min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800"
              >
                <option value="">All NIR districts</option>
                {[
                  ...new Set(
                    districts.map((district) => district.jurisdiction),
                  ),
                ]
                  .sort()
                  .map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
              </select>
            </label>
            <label className="text-xs text-slate-500">
              Rank by
              <select
                value={sort}
                onChange={(event) => onSort(event.target.value)}
                className="mt-1 min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800"
              >
                <option value="house">Largest House proposal</option>
                <option value="change">Biggest increase from NEP</option>
              </select>
            </label>
          </div>
          <div className="flex justify-between px-4 pb-2 pt-4 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            <span>Rank / representative / district</span>
            <span>{sort === 'change' ? 'Change' : 'House proposal'}</span>
          </div>
          <ol className="divide-y divide-slate-100">
            {visible.map(({ district, rank }) => {
              const active = selected?.id === district.id;
              const shared = district.headline.shared_office_total;
              const name =
                district.representative?.status === 'resolved'
                  ? district.representative.name
                  : 'Representative not confirmed';
              return (
                <li key={district.id}>
                  <button
                    type="button"
                    aria-pressed={active}
                    onClick={() => onSelect(district.id)}
                    className={`leaderboard-row flex w-full items-start gap-3 border-l-4 px-3 py-4 text-left transition-colors sm:px-4 ${active ? 'border-primary-500 bg-primary-50/70' : 'border-transparent hover:bg-slate-50'}`}
                  >
                    <span
                      className={`mt-3 w-5 shrink-0 text-center text-xs font-bold ${rank <= 3 ? 'text-primary-700' : 'text-slate-400'}`}
                    >
                      {rank}
                    </span>
                    <Portrait district={district} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-start">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold leading-5 text-slate-900">
                            {name}
                          </p>
                          <p className="mt-0.5 text-xs leading-5 text-slate-500">
                            {district.label}
                          </p>
                        </div>
                        <p className="shrink-0 text-base font-bold tabular-nums text-primary-800">
                          {sort === 'change'
                            ? district.fy2027_vs_proposal.delta_php === null
                              ? 'Not comparable'
                              : difference(
                                  district.fy2027_vs_proposal.delta_php,
                                )
                            : money(
                                district.fy2027_vs_proposal.hgab3_php,
                                true,
                              )}
                        </p>
                      </div>
                      <div
                        className="mt-2 h-1 overflow-hidden rounded-full bg-slate-100"
                        aria-hidden="true"
                      >
                        <div
                          className="h-full rounded-full bg-primary-500"
                          style={{
                            width: `${((district.fy2027_vs_proposal.hgab3_php ?? 0) / max) * 100}%`,
                          }}
                        />
                      </div>
                      {shared && (
                        <p className="mt-2 text-[10px] font-medium text-amber-800">
                          This office also serves another district.
                        </p>
                      )}
                      {active && (
                        <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-primary-700">
                          Viewing office projects
                          <ArrowRight size={12} />
                        </span>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ol>
          <p className="border-t border-slate-100 px-4 py-3 text-[11px] leading-5 text-slate-500">
            Ranks are within NIR. Tied figures share a rank. Do not add these
            cards together: several districts can share one office and its full
            amount.
          </p>
        </div>
        {selected && (
          <>
            <aside
              className="hidden space-y-4 lg:sticky lg:top-24 lg:block"
              aria-label="Selected district projects"
            >
              <DistrictSpotlight
                selected={selected}
                districts={districts}
                source={source}
                top={top}
                rows={rows}
                onProject={onProject}
                onBrowse={onBrowse}
              />
            </aside>
            <DetailSheet
              open={Boolean(selectedId)}
              mobileOnly
              label={selected.label}
              caption="District projects · FY2027"
              closeLabel="Close district details"
              onClose={onClose}
            >
              <DistrictSpotlight
                selected={selected}
                districts={districts}
                source={source}
                top={top}
                rows={rows}
                onProject={onProject}
                onBrowse={onBrowse}
              />
            </DetailSheet>
          </>
        )}
      </div>
      <p className="text-[10px] leading-5 text-slate-400">
        Representative portraits: House of Representatives of the Philippines ·
        public domain, via BetterGov. Names and district associations are from
        the source data.
      </p>
    </section>
  );
}
