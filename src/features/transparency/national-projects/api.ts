import {
  API_BASE,
  type DistrictSnapshot,
  type OfficeLens,
  PROJECTS_API,
  type Project,
  type Snapshot,
  type SourceMeta,
  type SourceNotice,
  totals,
} from './data';

const MAX_AGE = 5 * 60 * 1000;
let cached: Snapshot | null = null;

interface Page {
  meta: SourceMeta;
  disclaimers: SourceNotice[];
  data: {
    total: number;
    rows: Project[];
    sums: { nep_php: number; hgab3_php: number };
    office_lens?: OfficeLens;
  };
}

async function getPage(
  params: URLSearchParams,
  signal: AbortSignal,
): Promise<Page> {
  const response = await fetch(`${PROJECTS_API}?${params}`, {
    signal: AbortSignal.any([signal, AbortSignal.timeout(25000)]),
    headers: { Accept: 'application/json' },
  });
  if (!response.ok)
    throw new Error(
      `BetterGov returned HTTP ${response.status}. Please try again.`,
    );
  const content: Page = await response.json();
  if (
    content.meta?.currency !== 'PHP' ||
    content.meta?.scale !== 'pesos' ||
    content.meta?.fiscal_year !== 2027 ||
    !content.meta.source_commit ||
    !content.meta.built_at ||
    !Array.isArray(content.disclaimers) ||
    !Array.isArray(content.data?.rows) ||
    !Number.isSafeInteger(content.data.total) ||
    content.data.total < 0 ||
    !content.data.sums
  ) {
    throw new Error('The source data format changed. Please try again later.');
  }
  for (const row of content.data.rows) {
    if (
      !row.id ||
      typeof row.title !== 'string' ||
      row.region_key !== 'NIR' ||
      typeof row.status_label !== 'string' ||
      !Array.isArray(row.flags) ||
      typeof row.held !== 'boolean' ||
      ![row.nep_php, row.hgab3_php].every(
        (value) =>
          value === null || (Number.isSafeInteger(value) && value >= 0),
      )
    ) {
      throw new Error(
        'The source returned an invalid project record. Please try again later.',
      );
    }
  }
  return content;
}

export async function loadProjects(
  signal: AbortSignal,
  force = false,
): Promise<Snapshot> {
  if (!force && cached && Date.now() - cached.loadedAt < MAX_AGE) return cached;
  const params = new URLSearchParams({
    region: 'NIR',
    limit: '200',
    offset: '0',
  });
  const first = await getPage(params, signal);
  if (first.data.total > 20000)
    throw new Error(
      'The source dataset size changed unexpectedly. Please retry later.',
    );
  const pages = [first];
  for (let offset = 200; offset < first.data.total; offset += 200) {
    params.set('offset', String(offset));
    const page = await getPage(params, signal);
    if (
      page.meta.source_commit !== first.meta.source_commit ||
      page.meta.built_at !== first.meta.built_at ||
      page.data.total !== first.data.total
    ) {
      throw new Error(
        'BetterGov updated its data while loading. Refresh to get one consistent version.',
      );
    }
    pages.push(page);
  }
  const rows = pages.flatMap((page) => page.data.rows);
  const sums = totals(rows);
  if (
    rows.length !== first.data.total ||
    new Set(rows.map((row) => row.id)).size !== rows.length ||
    sums.nep !== first.data.sums.nep_php ||
    sums.house !== first.data.sums.hgab3_php
  ) {
    throw new Error(
      'The downloaded records do not reconcile with the source totals. Please retry.',
    );
  }
  const snapshot = {
    rows,
    meta: first.meta,
    disclaimers: first.disclaimers,
    loadedAt: Date.now(),
  };
  cached = snapshot;
  return snapshot;
}

export async function loadOfficeContext(office: string, signal: AbortSignal) {
  const page = await getPage(
    new URLSearchParams({ region: 'NIR', office, limit: '1' }),
    signal,
  );
  if (!page.data.office_lens)
    throw new Error('Office attribution context is unavailable.');
  return { lens: page.data.office_lens, notices: page.disclaimers };
}

export async function loadDistricts(
  signal: AbortSignal,
  sourceCommit: string,
): Promise<DistrictSnapshot> {
  const response = await fetch(`${API_BASE}/districts?region=NIR&limit=254`, {
    signal: AbortSignal.any([signal, AbortSignal.timeout(25000)]),
    headers: { Accept: 'application/json' },
  });
  if (!response.ok)
    throw new Error(
      `The district list is unavailable (HTTP ${response.status}).`,
    );
  const result = await response.json();
  if (
    !Array.isArray(result.data?.districts) ||
    result.data.districts.length !== result.data.total ||
    result.meta?.source_commit !== sourceCommit ||
    result.meta?.currency !== 'PHP' ||
    result.meta?.scale !== 'pesos' ||
    result.meta?.fiscal_year !== 2027 ||
    !Array.isArray(result.disclaimers) ||
    !Array.isArray(result.data.residual)
  ) {
    throw new Error(
      'The district and project lists are not from the same source version. Refresh to try again.',
    );
  }
  for (const district of result.data.districts) {
    if (
      typeof district.id !== 'string' ||
      typeof district.label !== 'string' ||
      !Array.isArray(district.offices) ||
      !district.attribution ||
      !district.headline ||
      !district.fy2027_vs_proposal ||
      ![
        district.fy2027_vs_proposal.nep_php,
        district.fy2027_vs_proposal.hgab3_php,
      ].every((value) => value === null || Number.isSafeInteger(value))
    ) {
      throw new Error(
        'The district source format changed. The project list is still available.',
      );
    }
  }
  return {
    districts: result.data.districts,
    meta: result.meta,
    notices: result.disclaimers,
    residualNote: result.data.residual_note,
    residual: result.data.residual,
  };
}
