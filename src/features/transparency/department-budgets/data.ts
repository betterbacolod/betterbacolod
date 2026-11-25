export const EXPLORER_BASE =
  'https://budget-assets.bettergov.ph/hgab/2027/explorer';
export const EXPLORER_PAGE = 'https://budget.bettergov.ph/hgab/2027/explorer';
export const DBM_NEP =
  'https://www.dbm.gov.ph/index.php/2027/national-expenditure-program-fy-2027';
export const DATA_PATH = '/data/department-budgets-2027.json';

export const DEPARTMENTS = [
  { id: 'department-of-education', short: 'DepEd', name: 'Education' },
  { id: 'department-of-health', short: 'DOH', name: 'Health' },
  {
    id: 'department-of-social-welfare-and-development',
    short: 'DSWD',
    name: 'Social welfare',
  },
] as const;

export const SCOPES = ['bacolod', 'nir', 'national'] as const;
export type Scope = (typeof SCOPES)[number];
export const SCOPE_NAMES: Record<Scope, string> = {
  bacolod: 'Bacolod City',
  nir: 'Negros Island Region',
  national: 'Nationwide',
};

export type SourcePage = [string, number, number, (string | number)?];
export interface BudgetLine {
  e: '1' | '2' | '3' | '6';
  n: number;
  h: number;
  s: 'same' | 'higher' | 'lower' | 'house_only' | 'nep_only' | 'unprogrammed';
  p?: SourcePage;
  q?: SourcePage;
  a?: 1;
  m?: string;
}

export interface BudgetNode {
  k: string;
  l: string;
  n: number;
  h: number;
  c?: BudgetNode[];
  x?: BudgetLine[];
}

export interface BudgetEntry {
  id: string;
  agency: string;
  path: string[];
  node: BudgetNode;
}

export interface Department {
  id: string;
  name: string;
  nep: number;
  house: number;
  allFunds: number;
  automatic: number;
  elsewhere: number;
  agencies: { id: string; name: string; nep: number; house: number }[];
  regions: BudgetEntry[];
}

export interface BudgetSnapshot {
  schema: 1;
  fiscalYear: 2027;
  currency: 'PHP';
  scale: 'pesos';
  builtAt: string;
  retrievedAt: string;
  sources: { url: string; sha256: string }[];
  departments: Department[];
}

export const EXPENSES: Record<BudgetLine['e'], { name: string; help: string }> =
  {
    '1': {
      name: 'Personnel services',
      help: 'Pay, allowances, and other personnel costs.',
    },
    '2': {
      name: 'MOOE',
      help: 'Maintenance and Other Operating Expenses: day-to-day operations such as utilities, supplies, travel, and services.',
    },
    '3': {
      name: 'Financial expenses',
      help: 'Financial charges and related costs.',
    },
    '6': {
      name: 'Capital outlays',
      help: 'Buildings, equipment, and other long-term assets.',
    },
  };

export const NEP_PAGE_NOTES: Record<string, string> = {
  d: 'The NEP includes this school within its division amount; it is not a separate additional allocation.',
  v: 'The NEP link opens the start of the division list; the school may be on a later page.',
  g: 'The NEP includes this activity within its program total.',
  t: 'The NEP link opens the start of the activity table.',
  x: 'The NEP table has no separately matched line for this office and expense class.',
};

export function sourcePdf(page: SourcePage) {
  if (
    !/^[a-z0-9-]+$/.test(page[0]) ||
    !Number.isSafeInteger(page[1]) ||
    page[1] < 1
  )
    return null;
  return `https://budget-assets.bettergov.ph/hgab/2027/pdf/${page[0]}.pdf#page=${page[1]}`;
}

export function money(amount: number | null, compact = false): string {
  if (amount === null) return 'Not separately listed';
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: compact ? 2 : 0,
    ...(compact ? { notation: 'compact' as const } : {}),
  }).format(amount);
}

export function lineAmount(line: BudgetLine, version: 'nep' | 'house') {
  if (
    (version === 'nep' && ['house_only', 'unprogrammed'].includes(line.s)) ||
    (version === 'house' && line.s === 'nep_only')
  )
    return null;
  return version === 'nep' ? line.n : line.h;
}

// Select an outermost boundary, then stop. Descendants stay inside that entry.
export function localEntries(
  department: Department,
  scope: Scope,
): BudgetEntry[] {
  if (scope === 'national')
    return department.agencies.map((agency) => ({
      id: agency.id,
      agency: agency.name,
      path: [],
      node: { k: 'agency', l: agency.name, n: agency.nep, h: agency.house },
    }));
  if (scope === 'nir') return department.regions;
  const entries: BudgetEntry[] = [];
  const walk = (entry: BudgetEntry) => {
    if (
      entry.node.k === 'office' &&
      entry.node.l === 'Division of Bacolod City'
    ) {
      entries.push(entry);
      return;
    }
    entry.node.c?.forEach((node, index) =>
      walk({
        ...entry,
        id: `${entry.id}.${index}`,
        path: [...entry.path, entry.node.l],
        node,
      }),
    );
  };
  department.regions.forEach(walk);
  return entries;
}

export function entryTitle(entry: BudgetEntry) {
  return (
    entry.path
      .filter((label) => label !== 'Negros Island Region (NIR)')
      .at(-1) || entry.node.l
  );
}

export function scopeForDepartment(
  department: Department,
  scope: Scope,
): Scope {
  return scope === 'bacolod' &&
    localEntries(department, 'bacolod').length === 0 &&
    department.regions.length > 0
    ? 'nir'
    : scope;
}

export function nodeMatches(node: BudgetNode, search: string): boolean {
  return (
    node.l.toLocaleLowerCase().includes(search) ||
    (node.c?.some((child) => nodeMatches(child, search)) ?? false)
  );
}

export function filterEntries(entries: BudgetEntry[], query: string) {
  const search = query.trim().toLocaleLowerCase();
  return entries
    .filter(
      (entry) =>
        !search ||
        [entry.agency, ...entry.path]
          .join(' ')
          .toLocaleLowerCase()
          .includes(search) ||
        nodeMatches(entry.node, search),
    )
    .sort((a, b) => b.node.h - a.node.h || a.id.localeCompare(b.id));
}

export function detailSearch(entry: BudgetEntry, query: string) {
  const search = query.trim().toLocaleLowerCase();
  return [entry.agency, ...entry.path]
    .join(' ')
    .toLocaleLowerCase()
    .includes(search)
    ? ''
    : search;
}

export function sumEntries(entries: BudgetEntry[], version: 'nep' | 'house') {
  return entries.reduce(
    (total, entry) => total + (version === 'nep' ? entry.node.n : entry.node.h),
    0,
  );
}

export function displayLabel(label: string) {
  if (label !== label.toUpperCase()) return label;
  return label
    .toLowerCase()
    .replace(/\b\w+/g, (word, index) =>
      index > 0 && ['of', 'the', 'and', 'for', 'to', 'in'].includes(word)
        ? word
        : word[0].toUpperCase() + word.slice(1),
    );
}
