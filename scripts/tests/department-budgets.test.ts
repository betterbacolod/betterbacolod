import { afterEach, describe, expect, mock, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { loadDepartmentBudgets } from '../../src/features/transparency/department-budgets/api';
import {
  type BudgetEntry,
  type BudgetLine,
  type BudgetNode,
  type BudgetSnapshot,
  detailSearch,
  displayLabel,
  EXPENSES,
  filterEntries,
  lineAmount,
  localEntries,
  money,
  scopeForDepartment,
  sourcePdf,
  sumEntries,
} from '../../src/features/transparency/department-budgets/data';
import {
  type RawDepartment,
  transformDepartment,
} from '../import-department-budgets';

const node = (
  l: string,
  n: number,
  extra: Partial<BudgetNode> = {},
): BudgetNode => ({ k: 'unit', l, n, h: n, ...extra });
const raw = (): RawDepartment => ({
  id: 'department-of-education',
  name: 'DEPARTMENT OF EDUCATION',
  nep: 1000,
  house: 1000,
  nep_browser: {
    all_funds_php: 1120,
    automatic_php: 100,
    new_here_php: 1000,
    elsewhere: [{ php: 20 }],
  },
  agencies: [
    {
      id: 'education',
      name: 'Education',
      nep: 1000,
      house: 1000,
      tree: [
        node('School operations', 1000, {
          k: 'activity',
          c: [
            node('Negros Island Region (NIR)', 600, {
              k: 'region',
              c: [
                node('Division of Bacolod City', 400, {
                  k: 'office',
                  c: [
                    node('School in Bacolod', 150),
                    node('Another school', 250),
                  ],
                }),
                node('Other division', 200, {
                  k: 'office',
                  c: [node('Bacolod Extension outside city', 200)],
                }),
              ],
            }),
            node('Region VI - Western Visayas', 400, {
              k: 'region',
              c: [node('Bacolod name elsewhere', 400)],
            }),
          ],
        }),
      ],
    },
  ],
});

describe('department budget scope and arithmetic', () => {
  test('retains only exact NIR boundaries and the unmodified subtree', () => {
    const source = raw();
    const department = transformDepartment(source);
    expect(department.regions).toHaveLength(1);
    expect(department.regions[0].node).toEqual(
      source.agencies[0].tree[0].c![0],
    );
    expect(department.regions[0].path).toEqual(['School operations']);
    expect(department.allFunds).toBe(1120);
    expect(department.elsewhere).toBe(20);
  });

  test('division totals never add nested schools or geographic text matches', () => {
    const department = transformDepartment(raw());
    const entries = localEntries(department, 'bacolod');
    expect(entries).toHaveLength(1);
    expect(sumEntries(entries, 'house')).toBe(400);
    expect(sumEntries(localEntries(department, 'nir'), 'house')).toBe(600);
    expect(sumEntries(localEntries(department, 'national'), 'house')).toBe(
      1000,
    );
  });

  test('a missing city boundary stays empty instead of dividing regional money', () => {
    const source = raw();
    source.agencies[0].tree[0].c![0].c![0].l = 'Another division';
    const department = transformDepartment(source);
    expect(localEntries(department, 'bacolod')).toEqual([]);
    expect(localEntries(department, 'nir')).toHaveLength(1);
  });

  test('switches an unavailable Bacolod scope to NIR without changing available scopes', () => {
    const deped = transformDepartment(raw());
    expect(scopeForDepartment(deped, 'bacolod')).toBe('bacolod');
    const regional = {
      ...deped,
      regions: deped.regions.map((entry) => ({
        ...entry,
        node: { ...entry.node, c: [] },
      })),
    };
    expect(scopeForDepartment(regional, 'bacolod')).toBe('nir');
    expect(scopeForDepartment(regional, 'nir')).toBe('nir');
    expect(scopeForDepartment(regional, 'national')).toBe('national');
    expect(scopeForDepartment({ ...deped, regions: [] }, 'bacolod')).toBe(
      'bacolod',
    );
  });

  test('an outermost city boundary is not selected again within its children', () => {
    const source = raw();
    source.agencies[0].tree[0].c![0].c![0].c!.push(
      node('Division of Bacolod City', 1, { k: 'office' }),
    );
    const entries = localEntries(transformDepartment(source), 'bacolod');
    expect(entries).toHaveLength(1);
    expect(sumEntries(entries, 'nep')).toBe(400);
  });

  test('school search preserves its parent boundary, and does not change totals', () => {
    const entries = localEntries(transformDepartment(raw()), 'bacolod');
    expect(filterEntries(entries, '  SCHOOL IN BACOLOD ')).toEqual(entries);
    expect(filterEntries(entries, 'school operations')).toEqual(entries);
    expect(detailSearch(entries[0], 'school operations')).toBe('');
    expect(detailSearch(entries[0], 'School in Bacolod')).toBe(
      'school in bacolod',
    );
    expect(filterEntries(entries, 'absent')).toEqual([]);
    expect(sumEntries(entries, 'house')).toBe(400);
  });

  test('sorts House amounts without mutating source order', () => {
    const entries: BudgetEntry[] = [
      { id: 'small', agency: '', path: [], node: node('Small', 1) },
      { id: 'large', agency: '', path: [], node: node('Large', 3) },
    ];
    expect(filterEntries(entries, '').map((entry) => entry.id)).toEqual([
      'large',
      'small',
    ]);
    expect(entries[0].id).toBe('small');
  });

  test('rejects inconsistent totals, unsafe amounts, and unrecognized evidence', () => {
    const mismatch = raw();
    mismatch.nep = 1001;
    expect(() => transformDepartment(mismatch)).toThrow(
      'totals do not reconcile',
    );
    const scope = raw();
    scope.nep_browser.all_funds_php++;
    expect(() => transformDepartment(scope)).toThrow(
      'scope does not reconcile',
    );
    const invalid = raw();
    invalid.agencies[0].tree[0].n = 1.5;
    expect(() => transformDepartment(invalid)).toThrow('integer pesos');
    const page = raw();
    page.agencies[0].tree[0].x = [
      { e: '1', n: 1, h: 1, s: 'same', q: ['nep2027-vol-i', 1, 1, 'unknown'] },
    ];
    expect(() => transformDepartment(page)).toThrow('evidence note');
  });

  test('missing lines and actual zero values stay distinct', () => {
    const line: BudgetLine = { e: '2', n: 0, h: 100, s: 'house_only' };
    expect(lineAmount(line, 'nep')).toBeNull();
    expect(lineAmount(line, 'house')).toBe(100);
    expect(lineAmount({ ...line, s: 'same', h: 0 }, 'nep')).toBe(0);
    expect(lineAmount({ ...line, s: 'nep_only' }, 'house')).toBeNull();
    expect(money(null)).toBe('Not separately listed');
    expect(money(0)).not.toBe(money(null));
    expect(EXPENSES['2'].help).toContain(
      'Maintenance and Other Operating Expenses',
    );
  });

  test('PDF links use the physical page, and reject unsafe document keys', () => {
    expect(sourcePdf(['nep2027-vol-i', 380, 356])).toBe(
      'https://budget-assets.bettergov.ph/hgab/2027/pdf/nep2027-vol-i.pdf#page=380',
    );
    expect(sourcePdf(['../unsafe', 1, 1])).toBeNull();
    expect(sourcePdf(['nep2027-vol-i', 0, 1])).toBeNull();
    expect(displayLabel('SUPPORT TO SCHOOLS AND LEARNERS PROGRAM')).toBe(
      'Support to Schools and Learners Program',
    );
  });
});

const snapshot: BudgetSnapshot = JSON.parse(
  readFileSync('public/data/department-budgets-2027.json', 'utf8'),
);

describe('published snapshot regression checks', () => {
  test('preserves national totals, all-funds reconciliation, and source provenance', () => {
    expect(snapshot.sources).toHaveLength(4);
    expect(
      snapshot.sources.every((source) => /^[a-f0-9]{64}$/.test(source.sha256)),
    ).toBe(true);
    for (const department of snapshot.departments) {
      expect(department.nep + department.automatic + department.elsewhere).toBe(
        department.allFunds,
      );
      expect(sumEntries(localEntries(department, 'national'), 'nep')).toBe(
        department.nep,
      );
      expect(sumEntries(localEntries(department, 'national'), 'house')).toBe(
        department.house,
      );
      expect(new Set(department.regions.map((entry) => entry.id)).size).toBe(
        department.regions.length,
      );
      expect(
        department.regions.every(
          (entry) =>
            entry.node.k === 'region' &&
            entry.node.l === 'Negros Island Region (NIR)',
        ),
      ).toBe(true);
    }
    expect(snapshot.departments[0].allFunds).toBe(975962852000);
  });

  test('Bacolod records are division boundaries, with school evidence preserved', () => {
    const deped = snapshot.departments[0];
    const entries = localEntries(deped, 'bacolod');
    expect(entries.length).toBeGreaterThan(0);
    expect(
      entries.every((entry) => entry.node.l === 'Division of Bacolod City'),
    ).toBe(true);
    const notes: BudgetLine[] = [];
    const walk = (node: BudgetNode) => {
      notes.push(...(node.x ?? []));
      node.c?.forEach(walk);
    };
    entries.forEach((entry) => walk(entry.node));
    expect(notes.some((line) => line.a === 1 && line.q?.[3] === 'd')).toBe(
      true,
    );
    expect(localEntries(snapshot.departments[1], 'bacolod')).toEqual([]);
    expect(localEntries(snapshot.departments[2], 'bacolod')).toEqual([]);
    expect(scopeForDepartment(deped, 'bacolod')).toBe('bacolod');
    expect(scopeForDepartment(snapshot.departments[1], 'bacolod')).toBe('nir');
    expect(scopeForDepartment(snapshot.departments[2], 'bacolod')).toBe('nir');
  });
});

const originalFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe('snapshot loading', () => {
  test('loads a valid snapshot from the same origin', async () => {
    const fetch = mock(async () => Response.json(snapshot));
    globalThis.fetch = fetch as unknown as typeof globalThis.fetch;
    const result = await loadDepartmentBudgets(new AbortController().signal);
    expect(result.fiscalYear).toBe(2027);
    expect(fetch.mock.calls[0][0]).toBe('/data/department-budgets-2027.json');
  });

  test('reports a failed response instead of treating it as empty data', async () => {
    globalThis.fetch = mock(
      async () => new Response('Unavailable', { status: 503 }),
    ) as unknown as typeof globalThis.fetch;
    await expect(
      loadDepartmentBudgets(new AbortController().signal),
    ).rejects.toThrow('HTTP 503');
  });

  test('rejects a snapshot with the wrong units or department set', async () => {
    for (const invalid of [
      { ...snapshot, scale: 'thousands' },
      { ...snapshot, departments: [] },
    ]) {
      globalThis.fetch = mock(async () =>
        Response.json(invalid),
      ) as unknown as typeof globalThis.fetch;
      await expect(
        loadDepartmentBudgets(new AbortController().signal),
      ).rejects.toThrow('format is invalid');
    }
  });
});
