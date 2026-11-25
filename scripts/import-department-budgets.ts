import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, rename, writeFile } from 'node:fs/promises';
import {
  type BudgetEntry,
  type BudgetLine,
  type BudgetNode,
  type BudgetSnapshot,
  DEPARTMENTS,
  type Department,
  EXPLORER_BASE,
} from '../src/features/transparency/department-budgets/data';

interface RawAgency {
  id: string;
  name: string;
  nep: number;
  house: number;
  tree: BudgetNode[];
}
export interface RawDepartment {
  id: string;
  name: string;
  nep: number;
  house: number;
  agencies: RawAgency[];
  nep_browser: {
    all_funds_php: number;
    automatic_php: number;
    new_here_php: number;
    elsewhere: { php: number }[];
  };
}

function check(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function pesos(value: number) {
  check(
    Number.isSafeInteger(value) && value >= 0,
    'Expected non-negative integer pesos.',
  );
}

function validateLine(line: BudgetLine) {
  check(['1', '2', '3', '6'].includes(line.e), 'Unknown expense class.');
  check(
    [
      'same',
      'higher',
      'lower',
      'house_only',
      'nep_only',
      'unprogrammed',
    ].includes(line.s),
    'Unknown comparison status.',
  );
  pesos(line.n);
  pesos(line.h);
  for (const page of [line.p, line.q]) {
    if (!page) continue;
    check(
      Array.isArray(page) &&
        /^[a-z0-9-]+$/.test(page[0]) &&
        Number.isSafeInteger(page[1]) &&
        page[1] > 0 &&
        Number.isSafeInteger(page[2]) &&
        page[2] >= 0,
      'Invalid source page.',
    );
  }
  if (line.q?.[3])
    check(
      ['d', 'v', 'g', 't', 'x'].includes(String(line.q[3])),
      'Unknown NEP evidence note.',
    );
}

function validateNode(node: BudgetNode, depth = 0) {
  check(depth < 30, 'Unexpectedly deep budget hierarchy.');
  check(
    typeof node.k === 'string' &&
      typeof node.l === 'string' &&
      node.l.length > 0,
    'Invalid budget label.',
  );
  pesos(node.n);
  pesos(node.h);
  check(node.c === undefined || Array.isArray(node.c), 'Invalid children.');
  check(
    node.x === undefined || Array.isArray(node.x),
    'Invalid expense lines.',
  );
  node.x?.forEach(validateLine);
  node.c?.forEach((child) => validateNode(child, depth + 1));
}

export function transformDepartment(raw: RawDepartment): Department {
  check(
    DEPARTMENTS.some((department) => department.id === raw.id),
    'Unexpected department.',
  );
  check(
    typeof raw.name === 'string' && Array.isArray(raw.agencies),
    'Invalid department.',
  );
  pesos(raw.nep);
  pesos(raw.house);
  const regions: BudgetEntry[] = [];
  const agencies = raw.agencies.map((agency) => {
    check(
      typeof agency.id === 'string' &&
        typeof agency.name === 'string' &&
        Array.isArray(agency.tree),
      'Invalid agency.',
    );
    pesos(agency.nep);
    pesos(agency.house);
    const walk = (node: BudgetNode, path: string[], id: string) => {
      if (node.k === 'region' && node.l === 'Negros Island Region (NIR)') {
        regions.push({ id, agency: agency.name, path, node });
        return;
      }
      node.c?.forEach((child, index) =>
        walk(child, [...path, node.l], `${id}.${index}`),
      );
    };
    agency.tree.forEach((node, index) => {
      validateNode(node);
      walk(node, [], `${agency.id}.${index}`);
    });
    return {
      id: agency.id,
      name: agency.name,
      nep: agency.nep,
      house: agency.house,
    };
  });
  check(
    new Set(agencies.map((agency) => agency.id)).size === agencies.length,
    'Duplicate agency IDs.',
  );
  check(
    agencies.reduce((sum, agency) => sum + agency.nep, 0) === raw.nep &&
      agencies.reduce((sum, agency) => sum + agency.house, 0) === raw.house,
    'Department and agency totals do not reconcile.',
  );
  const gap = raw.nep_browser;
  check(
    gap && Array.isArray(gap.elsewhere),
    'Missing national scope reconciliation.',
  );
  [gap.all_funds_php, gap.automatic_php, gap.new_here_php].forEach(pesos);
  gap.elsewhere.forEach((agency) => pesos(agency.php));
  const elsewhere = gap.elsewhere.reduce((sum, agency) => sum + agency.php, 0);
  check(
    gap.new_here_php === raw.nep &&
      gap.all_funds_php === raw.nep + gap.automatic_php + elsewhere,
    'National all-funds scope does not reconcile.',
  );
  check(
    regions.length > 0,
    'No separately identified NIR entries; review the source schema.',
  );
  return {
    id: raw.id,
    name: raw.name,
    nep: raw.nep,
    house: raw.house,
    allFunds: gap.all_funds_php,
    automatic: gap.automatic_php,
    elsewhere,
    agencies,
    regions,
  };
}

async function download(url: string) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(45000),
    headers: { Accept: 'application/json' },
  });
  check(response.ok, `${url}: HTTP ${response.status}`);
  const text = await response.text();
  return {
    text,
    source: { url, sha256: createHash('sha256').update(text).digest('hex') },
  };
}

async function main() {
  const indexUrl = `${EXPLORER_BASE}/index.json`;
  const first = await download(indexUrl);
  const index = JSON.parse(first.text);
  check(
    Number.isFinite(Date.parse(index.built_at)) &&
      Array.isArray(index.departments),
    'Invalid source index.',
  );
  const downloads = await Promise.all(
    DEPARTMENTS.map((department) =>
      download(`${EXPLORER_BASE}/d/${department.id}.json`),
    ),
  );
  const departments = downloads.map((download, i) => {
    const raw: RawDepartment = JSON.parse(download.text);
    check(
      raw.id === DEPARTMENTS[i].id,
      'Department response does not match its URL.',
    );
    const listed = index.departments.find(
      (department: { id: string }) => department.id === raw.id,
    );
    check(
      listed && raw.nep === listed.nep && raw.house === listed.house,
      'Index and department snapshot differ.',
    );
    return transformDepartment(raw);
  });
  const last = await download(indexUrl);
  check(
    first.source.sha256 === last.source.sha256,
    'Source index changed during import; retry.',
  );
  const snapshot: BudgetSnapshot = {
    schema: 1,
    fiscalYear: 2027,
    currency: 'PHP',
    scale: 'pesos',
    builtAt: index.built_at,
    retrievedAt: new Date().toISOString(),
    sources: [first.source, ...downloads.map((download) => download.source)],
    departments,
  };
  const directory = 'public/data';
  const output = `${directory}/department-budgets-2027.json`;
  const formatted = spawnSync(
    'bunx',
    ['--no-install', 'biome', 'format', `--stdin-file-path=${output}`],
    { input: JSON.stringify(snapshot), encoding: 'utf8' },
  );
  check(
    formatted.status === 0,
    'Could not format snapshot; existing data was not changed.',
  );
  await mkdir(directory, { recursive: true });
  await writeFile(`${output}.tmp`, formatted.stdout);
  await rename(`${output}.tmp`, output);
  console.log(
    `Imported ${departments.length} departments and ${departments.reduce((sum, department) => sum + department.regions.length, 0)} NIR activity entries. Source built ${snapshot.builtAt}.`,
  );
}

if (import.meta.main) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
