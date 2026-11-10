import { afterEach, describe, expect, mock, test } from 'bun:test';
import { loadProjects } from '../../src/features/transparency/national-projects/api';
import {
  BACOLOD_OFFICE,
  type District,
  districtProjects,
  filterProjects,
  money,
  type Project,
  projectsCsv,
  type SourceMeta,
  sortProjects,
  totals,
} from '../../src/features/transparency/national-projects/data';

const originalFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = originalFetch;
});

const meta: SourceMeta = {
  source_commit: 'verified-revision',
  built_at: '2026-10-26T08:46:14.383Z',
  currency: 'PHP',
  scale: 'pesos',
  fiscal_year: 2027,
  notice: 'Source notice',
};
const row = (id: string, extra: Partial<Project> = {}): Project => ({
  id,
  title: 'Drainage structure in Bacolod City',
  office: BACOLOD_OFFICE,
  office_kind: 'District Office',
  program: 'Flood control',
  pap: null,
  region_key: 'NIR',
  trace: 'amount_same',
  status_label: 'Same amount in both',
  bridge_group: 'unchanged',
  held: false,
  flags: [],
  nep_php: 1,
  hgab3_php: 2,
  delta_php: 1,
  nep_page: 1,
  hgab3_page: 2,
  pdf_url: {},
  url: 'https://budget.bettergov.ph/hgab/2027/dpwh/p/test',
  ...extra,
});
const envelope = (
  rows: Project[],
  total: number,
  sums = { nep_php: total, hgab3_php: total * 2 },
  revision = meta.source_commit,
) => ({
  meta: { ...meta, source_commit: revision },
  disclaimers: [],
  data: { rows, total, sums },
});

describe('proposal arithmetic and local filters', () => {
  test('links office names without splitting shared amounts', () => {
    const district = { offices: [{ name: 'Bacolod City DEO' }] } as District;
    const projects = [
      row('local'),
      row('central', { office: 'Central Office' }),
    ];
    expect(districtProjects(projects, district).map((item) => item.id)).toEqual(
      ['local'],
    );
    expect(districtProjects(projects, district)[0].hgab3_php).toBe(2);
  });
  test('keeps missing versions distinct from published zero amounts', () => {
    const rows = [
      row('a', { nep_php: null, hgab3_php: 300 }),
      row('b', { nep_php: 100, hgab3_php: 0 }),
    ];
    expect(totals(rows)).toMatchObject({
      nep: 100,
      house: 300,
      nepCount: 1,
      houseCount: 2,
    });
    expect(money(null)).toBe('Not listed');
    expect(money(0)).not.toBe('Not listed');
    expect(sortProjects(rows, 'nep').map((item) => item.id)).toEqual([
      'b',
      'a',
    ]);
  });

  test('office matching excludes centrally implemented and outside-city text matches', () => {
    const rows = [
      row('city'),
      row('central', { office: 'Central Office' }),
      row('talisay', {
        title: 'Bacolod highway in Talisay',
        office: 'Negros Occidental 1st DEO',
      }),
    ];
    const filters = {
      q: 'bacolod',
      office: BACOLOD_OFFICE,
      program: '',
      type: '',
      group: '',
      held: 'all',
    };
    expect(filterProjects(rows, filters).map((item) => item.id)).toEqual([
      'city',
    ]);
    expect(filterProjects(rows, { ...filters, office: '' })).toHaveLength(3);
    expect(filterProjects(rows, { ...filters, q: 'no such project' })).toEqual(
      [],
    );
  });

  test('review filter includes source flags as well as unconfirmed matches', () => {
    const rows = [
      row('a'),
      row('b', { held: true }),
      row('c', { flags: ['uncertain_match'] }),
    ];
    expect(
      filterProjects(rows, {
        q: '',
        office: '',
        program: '',
        type: '',
        group: '',
        held: 'only',
      }),
    ).toHaveLength(2);
  });

  test.each([
    'Construction of Multi-Purpose Building, Barangay Handumanan',
    'Construction (Completion) of Multi-Purpose Buildings, Barangay Taculing',
    'Rehabilitation of Mult-Purpose Building, Barangay Banago',
    'Rehabilitation of multipurpose building, Barangay Granada',
    'Construction of Multi Purpose Building, Barangay Cabug',
  ])('multipurpose type matches the building title: %s', (title) => {
    const project = row('building', { title, pap: null });
    expect(
      filterProjects([project], {
        q: '',
        office: '',
        program: '',
        type: 'multipurpose_building',
        group: '',
        held: 'all',
      }),
    ).toEqual([project]);
  });

  test('multipurpose type excludes roads even when their budget category says buildings', () => {
    const projects = [
      row('building', {
        title: 'Rehabilitation of Mult-Purpose Building, Barangay Banago',
      }),
      row('road', {
        title:
          'Rehabilitation of Road at Crispino V. Ramos Avenue, Barangay Taculing',
        pap: 'BIP - Multi-Purpose Buildings/ Facilities to support Social Services',
      }),
      row('facilities', { title: 'Construction of Multi-Purpose facilities' }),
    ];
    const filters = {
      q: '',
      office: '',
      program: '',
      type: 'multipurpose_building',
      group: '',
      held: 'all',
    };
    const result = filterProjects(projects, filters);
    expect(result.map((project) => project.id)).toEqual(['building']);
    expect(result[0]).toBe(projects[0]);
    expect(filterProjects(projects, { ...filters, type: '' })).toEqual(
      projects,
    );
  });

  test('project type combines with other filters and keeps both budget versions', () => {
    const projects = [
      row('house', {
        title: 'Construction of Multi-Purpose Building, Handumanan',
        nep_php: null,
        hgab3_php: 30,
        flags: ['house_only'],
        bridge_group: 'house_only',
      }),
      row('nep', {
        title: 'Construction of Multi-Purpose Building, Handumanan',
        nep_php: 10,
        hgab3_php: null,
      }),
      row('central', {
        title: 'Construction of Multi-Purpose Building, Handumanan',
        office: 'Central Office',
      }),
      row('zero', {
        title: 'Rehabilitation of Mult-Purpose Building, Banago',
        nep_php: 0,
        hgab3_php: 0,
      }),
    ];
    const filters = {
      q: '',
      office: BACOLOD_OFFICE,
      program: 'Flood control',
      type: 'multipurpose_building',
      group: '',
      held: 'all',
    };
    const selected = filterProjects(projects, filters);
    expect(selected.map((project) => project.id)).toEqual([
      'house',
      'nep',
      'zero',
    ]);
    expect(totals(selected)).toMatchObject({
      houseCount: 2,
      nepCount: 2,
      house: 30,
      nep: 10,
    });
    expect(
      filterProjects(projects, { ...filters, q: 'Handumanan' }),
    ).toHaveLength(2);
    expect(filterProjects(projects, { ...filters, held: 'hide' })).toHaveLength(
      2,
    );
    expect(
      filterProjects(projects, { ...filters, group: 'house_only' }),
    ).toHaveLength(1);
    const csv = projectsCsv(selected, meta);
    expect(csv).toContain('Rehabilitation of Mult-Purpose Building, Banago');
    expect(csv).not.toContain('"central"');
  });

  test('CSV preserves missing amounts and provenance and neutralizes formulas', () => {
    const csv = projectsCsv(
      [row('a', { title: '=HYPERLINK("bad")', nep_php: null })],
      meta,
    );
    expect(csv).toContain('"\'=HYPERLINK(""bad"")"');
    expect(csv).toContain('"","2"');
    expect(csv).toContain('"verified-revision"');
  });
});

describe('complete live dataset loading', () => {
  test('paginates and caches a reconciled result without refetching', async () => {
    const first = Array.from({ length: 200 }, (_, index) => row(String(index)));
    const fetcher = mock(async (input: string | URL | Request) => {
      const url = new URL(String(input));
      return Response.json(
        envelope(
          url.searchParams.get('offset') === '0' ? first : [row('200')],
          201,
        ),
      );
    });
    globalThis.fetch = fetcher as unknown as typeof fetch;
    const snapshot = await loadProjects(new AbortController().signal, true);
    expect(snapshot.rows).toHaveLength(201);
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(await loadProjects(new AbortController().signal)).toBe(snapshot);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  test('rejects a failed later page and retains the last complete result', async () => {
    const previous = await loadProjects(new AbortController().signal);
    globalThis.fetch = mock(async (input: string | URL | Request) =>
      new URL(String(input)).searchParams.get('offset') === '0'
        ? Response.json(
            envelope(
              Array.from({ length: 200 }, (_, index) => row(String(index))),
              201,
            ),
          )
        : new Response('Unavailable', { status: 503 }),
    ) as unknown as typeof fetch;
    await expect(
      loadProjects(new AbortController().signal, true),
    ).rejects.toThrow('HTTP 503');
    expect(await loadProjects(new AbortController().signal)).toBe(previous);
  });

  test('rejects duplicate records even if their amounts reconcile', async () => {
    globalThis.fetch = mock(async () =>
      Response.json(envelope([row('same'), row('same')], 2)),
    ) as unknown as typeof fetch;
    await expect(
      loadProjects(new AbortController().signal, true),
    ).rejects.toThrow('do not reconcile');
  });

  test('rejects mixed source revisions', async () => {
    globalThis.fetch = mock(async (input: string | URL | Request) => {
      const first = new URL(String(input)).searchParams.get('offset') === '0';
      return Response.json(
        envelope(
          first
            ? Array.from({ length: 200 }, (_, index) => row(String(index)))
            : [row('200')],
          201,
          undefined,
          first ? 'original' : 'updated',
        ),
      );
    }) as unknown as typeof fetch;
    await expect(
      loadProjects(new AbortController().signal, true),
    ).rejects.toThrow('one consistent version');
  });

  test('rejects changed units and incomplete totals', async () => {
    globalThis.fetch = mock(async () =>
      Response.json(envelope([row('a')], 2)),
    ) as unknown as typeof fetch;
    await expect(
      loadProjects(new AbortController().signal, true),
    ).rejects.toThrow('do not reconcile');
    globalThis.fetch = mock(async () =>
      Response.json({
        ...envelope([row('a')], 1),
        meta: { ...meta, scale: 'thousands' },
      }),
    ) as unknown as typeof fetch;
    await expect(
      loadProjects(new AbortController().signal, true),
    ).rejects.toThrow('format changed');
  });
});
