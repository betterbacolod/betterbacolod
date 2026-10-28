import { ExternalLink } from 'lucide-react';
import DetailSheet from './DetailSheet';
import { money, type Project, safeSourceUrl } from './data';

export default function ProjectDetails({
  project,
  requested,
  onClose,
}: {
  project: Project | undefined;
  requested: string;
  onClose: () => void;
}) {
  return (
    <DetailSheet
      open={Boolean(requested)}
      label={project?.title ?? 'Project details'}
      caption="Source comparison · FY2027"
      closeLabel="Close project details"
      onClose={onClose}
    >
      <div className="space-y-5 p-5 sm:p-7">
        <h2
          id="project-title"
          className="text-xl font-bold leading-snug text-slate-900"
        >
          {project?.title ?? 'Project not found in this NIR dataset'}
        </h2>
        {project ? (
          <>
            <p className="text-sm text-slate-600">
              {project.office ?? 'Office not specified'} ·{' '}
              {project.program ?? 'Program not specified'}
            </p>
            <div className="grid grid-cols-1 gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-slate-500">
                  Executive proposal · NEP
                </p>
                <p className="mt-1 font-semibold tabular-nums text-primary-800">
                  {money(project.nep_php)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">
                  House proposal · third reading
                </p>
                <p className="mt-1 font-semibold tabular-nums text-teal-700">
                  {money(project.hgab3_php)}
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                How the sources compare
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                {project.status_label}
              </p>
            </div>
            {(project.held || project.flags.length > 0) && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
                <p className="font-semibold">
                  Why this comparison needs checking
                </p>
                <p className="mt-1">
                  The source marks this project for a closer check. Read the
                  linked pages before treating the comparison as confirmed.
                </p>
                <ul className="mt-2 list-inside list-disc text-xs">
                  {project.held && (
                    <li>The project match has not been confirmed.</li>
                  )}
                  {project.flags.map((flag) => (
                    <li key={flag}>{flag.replaceAll('_', ' ')}</li>
                  ))}
                </ul>
              </div>
            )}
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-900">
                Check the printed documents
              </h3>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ['nep', 'NEP', project.nep_page],
                    ['hgab3', 'House bill', project.hgab3_page],
                  ] as const
                ).map(([key, label, page]) => {
                  const href = safeSourceUrl(project.pdf_url?.[key] ?? '');
                  return href ? (
                    <a
                      key={key}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-medium text-primary-700 hover:bg-primary-50"
                    >
                      {label}
                      {page !== null ? ` · PDF p. ${page}` : ''}
                      <ExternalLink size={14} />
                    </a>
                  ) : (
                    <span key={key} className="py-3 text-xs text-slate-500">
                      {label}: source link unavailable
                    </span>
                  );
                })}
              </div>
            </div>
            <p className="text-xs leading-5 text-slate-500">
              These are proposed amounts, not money already spent. “Not listed”
              means no matching line was found in that version. We cannot tell
              who requested a project from the listed office.
            </p>
            <a
              href={safeSourceUrl(project.url)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary-600 px-4 text-sm font-semibold text-white hover:bg-primary-700"
            >
              View on BetterGov
              <ExternalLink size={15} />
            </a>
            <p className="break-all font-mono text-[11px] text-slate-400">
              Record: {project.id}
            </p>
          </>
        ) : (
          <p className="text-sm text-slate-600">
            The source may have changed since this link was shared. Close this
            panel to browse the current records.
          </p>
        )}
      </div>
    </DetailSheet>
  );
}
