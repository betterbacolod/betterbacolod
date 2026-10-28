export const API_BASE = 'https://budget.bettergov.ph/api/v1/hgab/2027';
export const PROJECTS_API = `${API_BASE}/datasets/dpwh/projects`;
export const BACOLOD_OFFICE = 'Bacolod City District Engineering Office';
export const PAGE_SIZE = 20;

export interface Project {
  id: string;
  title: string;
  program: string | null;
  pap: string | null;
  office: string | null;
  office_kind: string | null;
  region_key: string;
  trace: string;
  status_label: string;
  bridge_group: string | null;
  held: boolean;
  flags: string[];
  nep_php: number | null;
  hgab3_php: number | null;
  delta_php: number | null;
  nep_page: number | null;
  hgab3_page: number | null;
  pdf_url: { nep?: string; hgab3?: string };
  url: string;
}

export interface SourceNotice {
  id: string;
  title: string;
  body: string;
  url: string;
}

export interface SourceMeta {
  source_commit: string;
  built_at: string;
  notice: string;
  currency: 'PHP';
  scale: 'pesos';
  fiscal_year: 2027;
}

export interface Snapshot {
  rows: Project[];
  meta: SourceMeta;
  disclaimers: SourceNotice[];
  loadedAt: number;
}

export interface OfficeLens {
  printed_office: string;
  offices: {
    id: string;
    name: string;
    tier_text: string;
    districts: { id: string; label: string; url: string }[];
    office_change?: { rows: number; note: string };
  }[];
  shared_office_total: boolean;
  tier_meaning: string;
  note: string;
  no_office?: unknown;
  residual_api: string;
}

export interface Filters {
  q: string;
  office: string;
  program: string;
  group: string;
  held: string;
}

export interface District {
  id: string;
  label: string;
  jurisdiction: string;
  district_label: string;
  attribution: { code: string; label: string; meaning: string };
  representative: {
    name: string;
    status: string;
    portrait?: {
      url: string;
      attribution: string;
      license: string;
      source_url: string;
    } | null;
  } | null;
  offices: {
    id: string;
    name: string;
    tier_text: string;
    co_served_district_ids: string[];
  }[];
  headline: {
    shared_office_total: boolean;
    co_served_district_ids: string[];
    note: string;
  };
  fy2027_vs_proposal: {
    nep_php: number | null;
    hgab3_php: number | null;
    delta_php: number | null;
    unconfirmed_rows: number;
    unconfirmed_php: number;
  };
  url: string;
}

export interface DistrictSnapshot {
  districts: District[];
  meta: SourceMeta;
  notices: SourceNotice[];
  residualNote: string;
  residual: { fy: number; stage: string; not_on_any_district_php: number }[];
}

export function officeKey(name: string) {
  return name
    .replace('District Engineering Office', 'DEO')
    .toLocaleLowerCase()
    .trim();
}

export function districtProjects(rows: Project[], district: District) {
  const keys = new Set(
    district.offices.map((office) => officeKey(office.name)),
  );
  return rows.filter(
    (project) => project.office && keys.has(officeKey(project.office)),
  );
}

export const GROUPS = [
  ['unchanged', 'Same amount'],
  ['increased', 'Increased'],
  ['decreased', 'Decreased'],
  ['house_only', 'House only · candidate'],
  ['nep_only', 'NEP only · candidate'],
  ['scope_review', 'Scope needs review'],
] as const;

export const SORTS = [
  ['house', 'House amount: high to low'],
  ['nep', 'NEP amount: high to low'],
  ['change', 'Largest amount difference'],
  ['title', 'Project name: A–Z'],
] as const;

const fullPeso = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 0,
});
const shortPeso = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  notation: 'compact',
  maximumFractionDigits: 2,
});
export const money = (amount: number | null, compact = false) =>
  amount === null
    ? 'Not listed'
    : (compact ? shortPeso : fullPeso).format(amount);

export const difference = (amount: number) =>
  `${amount > 0 ? '+' : ''}${money(amount, true)}`;

export function safeSourceUrl(value: string): string | undefined {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' &&
      ['budget.bettergov.ph', 'budget-assets.bettergov.ph'].includes(
        url.hostname,
      )
      ? url.href
      : undefined;
  } catch {
    return undefined;
  }
}

export function totals(rows: Project[]) {
  return rows.reduce(
    (result, row) => ({
      nep: result.nep + (row.nep_php ?? 0),
      house: result.house + (row.hgab3_php ?? 0),
      nepCount: result.nepCount + Number(row.nep_php !== null),
      houseCount: result.houseCount + Number(row.hgab3_php !== null),
      uncertain: result.uncertain + Number(row.held || row.flags.length > 0),
    }),
    { nep: 0, house: 0, nepCount: 0, houseCount: 0, uncertain: 0 },
  );
}

export function filterProjects(rows: Project[], filters: Filters) {
  const words = filters.q
    .toLocaleLowerCase()
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return rows.filter((row) => {
    const text =
      `${row.title} ${row.office ?? ''} ${row.program ?? ''} ${row.pap ?? ''}`.toLocaleLowerCase();
    return (
      words.every((word) => text.includes(word)) &&
      (!filters.office || row.office === filters.office) &&
      (!filters.program || row.program === filters.program) &&
      (!filters.group || row.bridge_group === filters.group) &&
      (filters.held !== 'only' || row.held || row.flags.length > 0) &&
      (filters.held !== 'hide' || (!row.held && row.flags.length === 0))
    );
  });
}

export function sortProjects(rows: Project[], sort: string) {
  return [...rows].sort((a, b) => {
    if (sort === 'title')
      return a.title.localeCompare(b.title) || a.id.localeCompare(b.id);
    const value = (row: Project) =>
      sort === 'nep'
        ? row.nep_php
        : sort === 'change'
          ? Math.abs((row.hgab3_php ?? 0) - (row.nep_php ?? 0))
          : row.hgab3_php;
    const av = value(a),
      bv = value(b);
    return (bv ?? -1) - (av ?? -1) || a.id.localeCompare(b.id);
  });
}

export function groupProjects(rows: Project[], field: 'office' | 'program') {
  const groups = new Map<string, Project[]>();
  for (const row of rows) {
    const name = row[field] || 'Not specified';
    const group = groups.get(name) ?? [];
    group.push(row);
    groups.set(name, group);
  }
  return [...groups]
    .map(([name, projects]) => ({ name, ...totals(projects) }))
    .sort((a, b) => b.house - a.house || b.nep - a.nep);
}

const csvCell = (value: string | number | null) => {
  let text = value === null ? '' : String(value);
  // Prevent spreadsheet formula execution in exported source text.
  if (typeof value === 'string' && /^[=+@\-\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
};

export function projectsCsv(rows: Project[], meta: SourceMeta) {
  const header = [
    'id',
    'title',
    'office',
    'program',
    'nep_php',
    'house_php',
    'status',
    'unconfirmed_match',
    'flags',
    'source_commit',
    'source_built_at',
    'source_url',
  ];
  return (
    '\uFEFF' +
    [
      header,
      ...rows.map((row) => [
        row.id,
        row.title,
        row.office,
        row.program,
        row.nep_php,
        row.hgab3_php,
        row.status_label,
        String(row.held),
        row.flags.join('; '),
        meta.source_commit,
        meta.built_at,
        row.url,
      ]),
    ]
      .map((row) => row.map(csvCell).join(','))
      .join('\r\n')
  );
}
