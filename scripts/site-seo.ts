import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { seoGuides } from '../src/data/seoGuides';
import { pageStructuredData, siteMetadata } from '../src/data/siteMetadata';
import type { BudgetSnapshot } from '../src/features/transparency/department-budgets/data';
import {
  departmentBudgetsMetadata,
  departmentBudgetsStructuredData,
} from '../src/features/transparency/department-budgets/metadata';
import { escapeHtml, readSpaTemplate, renderPageHtml } from './page-seo';

const main = (body: string) =>
  `<main style="max-width:960px;margin:32px auto;padding:24px;font-family:Arial,sans-serif;line-height:1.6;color:#0f172a"><nav aria-label="Main"><a href="/">BetterBacolod</a> · <a href="/services">Services</a> · <a href="/government">Government</a> · <a href="/transparency">Transparency</a></nav>${body}</main>`;

export function renderDepartmentBudgetsHtml(
  template: string,
  snapshot: BudgetSnapshot,
) {
  const meta = departmentBudgetsMetadata;
  return renderPageHtml(
    template,
    meta,
    main(`<h1>Where would department funding go?</h1><p>${escapeHtml(meta.description)}</p>
    <p>Proposed FY2027 funding, not actual spending or an enacted final budget. This saved comparison is under citizen review. Check source documents before citing amounts.</p>
    <p>Source built ${escapeHtml(snapshot.builtAt)}. Snapshot retrieved ${escapeHtml(snapshot.retrievedAt)}.</p>
    <h2>What is covered?</h2><ul><li>DepEd division-office entries labelled Division of Bacolod City within NIR, with included school breakdowns.</li><li>DepEd, DOH, and DSWD entries explicitly identified as Negros Island Region, not separate Bacolod allocations.</li><li>National department and agency new appropriations. Automatic appropriations are outside the House comparison.</li></ul>
    <p>The page compares the Executive National Expenditure Program with House Bill 10858, third reading. Parent and school amounts must not be added together.</p>
    <p><a href="/data/department-budgets-2027.json">Download the saved JSON dataset, source URLs, and SHA-256 hashes</a>.</p>
    <p>Sources: <a href="https://www.dbm.gov.ph/index.php/2027/national-expenditure-program-fy-2027">Official DBM FY2027 NEP</a>; <a href="https://budget.bettergov.ph/hgab/2027/sources">BetterGov source documents and methodology</a>.</p>
    <p><a href="/transparency/national-projects">Explore proposed DPWH projects separately</a>. Enable JavaScript to filter activities, offices, and schools.</p>`),
    departmentBudgetsStructuredData(snapshot),
  );
}

export function writeSiteSeoHtml() {
  const template = readSpaTemplate();
  writeFileSync('dist/spa.html', template);
  const write = (path: string, html: string) => {
    const directory = path === '/' ? 'dist' : `dist${path}`;
    mkdirSync(directory, { recursive: true });
    writeFileSync(`${directory}/index.html`, html);
  };
  write(
    '/',
    renderPageHtml(
      template,
      { description: siteMetadata.description, url: '/' },
      main(
        `<h1>Bacolod City services and public data</h1><p>${escapeHtml(siteMetadata.description)}</p><p>BetterBacolod is an independent civic information project, not an official government website.</p><h2>Explore BetterBacolod</h2><ul><li><a href="/services">Public service guides</a></li><li><a href="/government">City government and barangay information</a></li><li><a href="/energy">Energy data</a></li><li><a href="/transparency">Budgets, fuel prices, and public projects</a></li><li><a href="/transparency/department-budgets">2027 department budget proposals</a></li><li><a href="/transparency/national-projects">2027 NIR DPWH project comparisons</a></li></ul><h2>Bacolod guides</h2><ul>${seoGuides.map((guide) => `<li><a href="${guide.path}">${escapeHtml(guide.title)}</a></li>`).join('')}</ul>`,
      ),
    ),
  );
  const transparencyDescription =
    'Explore Bacolod City transparency data, DOE fuel prices, flood control projects, infrastructure links, procurement, and public reports.';
  write(
    '/transparency',
    renderPageHtml(
      template,
      {
        title: 'Bacolod Transparency Data',
        description: transparencyDescription,
        url: '/transparency',
      },
      main(
        `<h1>Transparency</h1><p>${transparencyDescription}</p><h2>Budget proposals and public records</h2><ul><li><a href="/transparency/department-budgets">2027 Department Budgets: DepEd, DOH, and DSWD</a></li><li><a href="/transparency/national-projects">2027 DPWH National Projects in Bacolod and NIR</a></li><li><a href="/bacolod-fuel-prices">Bacolod fuel prices guide</a></li></ul><p>Enable JavaScript to open City Budget, Budget and Procurement, Flood Control, Fuel Price Watch, and DIME sections. Proposed budgets are not records of actual spending.</p>`,
      ),
      pageStructuredData(
        '/transparency',
        'Bacolod Transparency Data',
        transparencyDescription,
      ),
    ),
  );
  const snapshot: BudgetSnapshot = JSON.parse(
    readFileSync('public/data/department-budgets-2027.json', 'utf8'),
  );
  write(
    departmentBudgetsMetadata.url,
    renderDepartmentBudgetsHtml(template, snapshot),
  );
  for (const guide of seoGuides) {
    write(
      guide.path,
      renderPageHtml(
        template,
        { ...guide, url: guide.path },
        main(
          `<h1>${escapeHtml(guide.heading)}</h1><p>${escapeHtml(guide.intro)}</p><h2>Service guides</h2><ul>${guide.primaryLinks.map((link) => `<li><a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a><p>${escapeHtml(link.description)}</p></li>`).join('')}</ul><h2>Related Bacolod resources</h2><ul>${guide.relatedLinks.map((link) => `<li><a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a></li>`).join('')}</ul>`,
        ),
        pageStructuredData(guide.path, guide.title, guide.description),
      ),
    );
  }
}
