import { ChevronDown, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import {
  type BudgetLine,
  type BudgetNode,
  displayLabel,
  EXPENSES,
  lineAmount,
  money,
  NEP_PAGE_NOTES,
  nodeMatches,
  sourcePdf,
} from './data';

export function Amounts({
  nep,
  house,
}: {
  nep: number | null;
  house: number | null;
}) {
  return (
    <dl className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,9rem),1fr))] gap-3 text-sm">
      <div>
        <dt className="text-slate-500">Executive proposal</dt>
        <dd className="mt-1 break-words font-semibold tabular-nums text-slate-800">
          {money(nep)}
        </dd>
      </div>
      <div>
        <dt className="text-slate-500">House bill</dt>
        <dd className="mt-1 break-words font-semibold tabular-nums text-primary-800">
          {money(house)}
        </dd>
      </div>
    </dl>
  );
}

function Evidence({ line }: { line: BudgetLine }) {
  const note = line.q?.[3] ? NEP_PAGE_NOTES[String(line.q[3])] : null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <h4 className="text-sm font-semibold text-slate-900">
        {EXPENSES[line.e].name}
      </h4>
      <p className="mb-3 mt-1 text-sm leading-5 text-slate-500">
        {EXPENSES[line.e].help}
      </p>
      <Amounts
        nep={lineAmount(line, 'nep')}
        house={lineAmount(line, 'house')}
      />
      <div className="mt-2 flex flex-wrap gap-x-5">
        {(
          [
            ['NEP source', line.q],
            ['House source', line.p],
          ] as const
        ).map(([label, page]) => {
          const href = page ? sourcePdf(page) : null;
          return href && page ? (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-primary-700 underline underline-offset-2"
            >
              {label} · PDF p. {page[1]}{' '}
              <ExternalLink size={13} aria-hidden="true" />
            </a>
          ) : null;
        })}
      </div>
      {line.a === 1 && (
        <p className="mt-1 text-sm text-amber-900">
          From the non-implementing schools list; not additional funding on top
          of the division amount.
        </p>
      )}
      {note && <p className="mt-1 text-sm leading-5 text-slate-600">{note}</p>}
      {line.m && (
        <p className="mt-1 text-sm text-slate-600">
          Source matching note: {line.m}
        </p>
      )}
    </div>
  );
}

export default function BudgetDetails({
  node,
  search = '',
  defaultOpen = false,
}: {
  node: BudgetNode;
  search?: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen || Boolean(search));
  const selfMatches = node.l.toLocaleLowerCase().includes(search);
  const children =
    node.c?.filter(
      (child) => !search || selfMatches || nodeMatches(child, search),
    ) ?? [];
  return (
    <details
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
      className="group/node min-w-0 rounded-lg border border-slate-200 bg-slate-50/60"
    >
      <summary className="flex min-h-14 cursor-pointer list-none items-start gap-3 p-3 focus-visible:outline-primary-600 [&::-webkit-details-marker]:hidden">
        <ChevronDown
          size={17}
          aria-hidden="true"
          className={`mt-1 shrink-0 text-slate-500 transition-transform motion-reduce:transition-none ${open ? '' : '-rotate-90'}`}
        />
        <span className="min-w-0 flex-1">
          <span className="block break-words text-sm font-medium text-slate-800">
            {displayLabel(node.l)}
          </span>
          <span className="mt-1 block text-sm tabular-nums text-primary-800">
            House: {money(node.h)}
          </span>
        </span>
      </summary>
      {open && (
        <div className="space-y-3 border-t border-slate-200 p-3">
          <Amounts nep={node.n} house={node.h} />
          {(node.x ?? []).map((line, index) => (
            <Evidence key={`${line.e}-${index}`} line={line} />
          ))}
          {children.length > 0 && (
            <>
              <p className="text-sm leading-5 text-slate-500">
                Included breakdown. Do not add these figures to the amount
                above.
              </p>
              {children.map((child, index) => (
                <BudgetDetails
                  key={`${child.l}-${index}`}
                  node={child}
                  search={selfMatches ? '' : search}
                />
              ))}
            </>
          )}
        </div>
      )}
    </details>
  );
}
