import {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  ExternalLink,
} from 'lucide-react';
import {
  type District,
  type DistrictSnapshot,
  districtProjects,
  money,
  type Project,
  safeSourceUrl,
} from './data';

export default function DistrictSpotlight({
  selected,
  districts,
  source,
  top,
  rows,
  onProject,
  onBrowse,
}: {
  selected: District;
  districts: District[];
  source: DistrictSnapshot;
  top: Project[];
  rows: Project[];
  onProject: (id: string) => void;
  onBrowse: (office: string) => void;
}) {
  const residual = source.residual.find(
    (item) => item.fy === 2027 && item.stage === 'hgab3',
  );
  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary-700">
            Your district, closer up
          </p>
          <h3 className="mt-2 text-xl font-bold text-slate-950">
            {selected.label}
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            {selected.representative?.name ?? 'Representative not confirmed'}
          </p>
          <p className="mt-3 text-xs leading-5 text-slate-500">
            {selected.offices.map((office) => office.name).join(' · ')}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3">
            <div>
              <p className="text-[11px] text-slate-500">Executive proposal</p>
              <p className="mt-1 text-lg font-bold tabular-nums text-primary-800">
                {money(selected.fy2027_vs_proposal.nep_php, true)}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500">House proposal</p>
              <p className="mt-1 text-lg font-bold tabular-nums text-teal-700">
                {money(selected.fy2027_vs_proposal.hgab3_php, true)}
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-500">
            {selected.headline.shared_office_total
              ? `This office also serves ${selected.headline.co_served_district_ids.map((id) => districts.find((district) => district.id === id)?.label ?? id).join(', ')}. The shared amount is not split between them.`
              : 'Comparison uses the same project coverage in both proposals.'}
          </p>
          {selected.fy2027_vs_proposal.unconfirmed_rows > 0 && (
            <p className="mt-2 text-xs leading-5 text-amber-900">
              {selected.fy2027_vs_proposal.unconfirmed_rows} project matches
              have not been confirmed. Check the source pages before drawing a
              conclusion.
            </p>
          )}
        </div>
        <div className="p-5">
          <h4 className="font-semibold text-slate-900">
            Where is the biggest funding planned?
          </h4>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Largest House allocations under the serving office. The projects
            below are sorted by proposed amount. The source does not give an
            official priority order. Projects may serve other places.
          </p>
          <ol className="mt-4 space-y-4">
            {top.map((project, index) => (
              <li key={project.id}>
                <button
                  type="button"
                  onClick={() => onProject(project.id)}
                  className="group w-full text-left"
                >
                  <div className="flex items-start gap-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-100 text-xs font-semibold text-slate-500">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-5 text-primary-800 group-hover:underline">
                        {project.title}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs text-slate-500">
                          {project.pap ?? project.program}
                        </span>
                        <span className="text-base font-bold tabular-nums text-teal-700">
                          {money(project.hgab3_php, true)}
                        </span>
                      </div>
                      {(project.held || project.flags.length > 0) && (
                        <p className="mt-1 text-[11px] text-amber-800">
                          Comparison needs checking
                        </p>
                      )}
                    </div>
                    <ArrowUpRight
                      size={14}
                      className="mt-1 shrink-0 text-slate-400"
                    />
                  </div>
                </button>
              </li>
            ))}
          </ol>
          {top.length === 0 && (
            <p className="py-4 text-sm text-slate-500">
              No House project rows could be linked to this office.
            </p>
          )}
          <button
            type="button"
            onClick={() => {
              const office = rows.find(
                (row) => districtProjects([row], selected).length > 0,
              )?.office;
              onBrowse(office ?? '');
            }}
            className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-3 text-sm font-semibold text-white hover:bg-primary-700"
          >
            Explore office projects <ArrowRight size={15} />
          </button>
          <a
            href={safeSourceUrl(selected.url)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex min-h-11 w-full items-center justify-center gap-2 text-xs font-medium text-primary-700"
          >
            Full office history on BetterGov <ExternalLink size={13} />
          </a>
        </div>
      </div>
      <details className="rounded-xl border border-slate-200 bg-white px-4 text-xs leading-5 text-slate-500">
        <summary className="flex min-h-11 cursor-pointer items-center gap-2 font-medium text-slate-700">
          What the leaderboard leaves out
          <ChevronDown size={12} />
        </summary>
        <div className="space-y-3 pb-4">
          <p>
            Central Office, regional office, and some unmatched or office-change
            amounts do not appear on district cards. Office project lists can
            include rows excluded from the leaderboard.
          </p>
          <p>{selected.attribution.meaning}</p>
          <p>{source.residualNote}</p>
          {residual && (
            <p>
              For context, {money(residual.not_on_any_district_php, true)} in
              the <strong>national</strong> House DPWH comparison sits outside
              district cards. This is nationwide, not an NIR subtotal.
            </p>
          )}
          {source.notices.map((notice) => (
            <p key={notice.id}>
              {notice.body}{' '}
              <a
                className="underline"
                href={safeSourceUrl(notice.url)}
                target="_blank"
                rel="noopener noreferrer"
              >
                Source notice
              </a>
            </p>
          ))}
        </div>
      </details>
    </>
  );
}
