import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { seoGuides } from '../../src/data/seoGuides';
import { siteMetadata } from '../../src/data/siteMetadata';
import type { BudgetSnapshot } from '../../src/features/transparency/department-budgets/data';
import { renderPageHtml } from '../page-seo';
import { renderDepartmentBudgetsHtml } from '../site-seo';

const template =
  '<html><head><title>Generic</title><meta data-rh="true" property="og:title" content="Generic"><meta name="description" content="Generic"></head><body><div id="root"></div><script src="/app.js"></script></body></html>';
const snapshot: BudgetSnapshot = JSON.parse(
  readFileSync('public/data/department-budgets-2027.json', 'utf8'),
);
const schemas = (html: string) =>
  Array.from(
    html.matchAll(
      /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
    ),
    (match) => JSON.parse(match[1]),
  );

describe('standard SEO and machine-readable source attribution', () => {
  test('serves useful department content, one canonical and social card without JavaScript', () => {
    const html = renderDepartmentBudgetsHtml(template, snapshot);
    expect(html.match(/<title>/g)).toHaveLength(1);
    expect(html.match(/property="og:title"/g)).toHaveLength(1);
    expect(html.match(/rel="canonical"/g)).toHaveLength(1);
    expect(html).toContain(
      'https://betterbacolod.org/transparency/department-budgets',
    );
    expect(html).toContain('not actual spending');
    expect(html).toContain('Division of Bacolod City');
    expect(html).toContain(snapshot.builtAt);
    expect(html).toContain('href="/data/department-budgets-2027.json"');
    expect(html).toContain('<script src="/app.js"></script>');
    expect(html).not.toContain('content="Generic"');
    const data = schemas(html);
    const dataset = data.find((item) => item['@type'] === 'Dataset');
    expect(dataset.dateModified).toBe(snapshot.builtAt);
    expect(dataset.distribution.encodingFormat).toBe('application/json');
    expect(dataset.isBasedOn).toHaveLength(4);
    expect(dataset.description).toContain('not a city allocation');
    expect(dataset).not.toHaveProperty('license');
    expect(data.some((item) => item['@type'] === 'WebSite')).toBe(true);
    expect(data.some((item) => item['@type'] === 'Organization')).toBe(true);
  });

  test('escapes metadata and JSON-LD without changing the parsed values', () => {
    const value = '</script><script>alert("test")</script>';
    const html = renderPageHtml(
      template,
      { title: 'A & B', description: value, url: '/safe' },
      '<main>Safe visible text</main>',
      [{ '@type': 'Thing', name: value }],
    );
    expect(html).toContain('A &amp; B');
    expect(schemas(html).find((item) => item['@type'] === 'Thing').name).toBe(
      value,
    );
    expect(html).not.toContain(value);
    expect(() =>
      renderPageHtml('<head></head>', { description: '', url: '/' }, ''),
    ).toThrow('root markup changed');
  });

  test('every generated guide and budget page has an explicit Vercel rewrite before the fallback', () => {
    const config = JSON.parse(readFileSync('vercel.json', 'utf8'));
    const paths = [
      '/transparency',
      '/transparency/department-budgets',
      ...seoGuides.map((guide) => guide.path),
    ];
    for (const path of paths) {
      const index = config.rewrites.findIndex(
        (rewrite: { source: string }) => rewrite.source === path,
      );
      expect(index).toBeGreaterThanOrEqual(0);
      expect(index).toBeLessThan(config.rewrites.length - 1);
      expect(config.rewrites[index].destination).toBe(`${path}/index.html`);
    }
    expect(
      config.rewrites.some(
        (rewrite: { source: string }) => rewrite.source === '/',
      ),
    ).toBe(false);
    expect(config.rewrites.at(-1).destination).toBe('/spa.html');
    expect(siteMetadata.description).toContain('Bacolod');
  });
});
