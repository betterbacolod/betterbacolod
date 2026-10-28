import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import {
  nationalProjectsMetadata as meta,
  nationalProjectsStructuredData,
} from '../src/features/transparency/national-projects/metadata';

const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (char) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        char
      ]!,
  );

export function renderNationalProjectsHtml(template: string) {
  const title = `${meta.title} | BetterBacolod`;
  const canonical = `https://betterbacolod.org${meta.url}`;
  const tags = [
    `<title>${escapeHtml(title)}</title>`,
    `<link data-rh="true" rel="canonical" href="${canonical}" />`,
    ...[
      ['name', 'description', meta.description],
      ['name', 'keywords', meta.keywords],
      ['property', 'og:title', title],
      ['property', 'og:description', meta.description],
      ['property', 'og:url', canonical],
      ['property', 'og:type', 'website'],
      ['property', 'og:site_name', 'BetterBacolod'],
      ['property', 'og:image', meta.image],
      ['property', 'og:image:alt', meta.imageAlt],
      ['property', 'og:image:width', String(meta.imageWidth)],
      ['property', 'og:image:height', String(meta.imageHeight)],
      ['name', 'twitter:card', 'summary_large_image'],
      ['name', 'twitter:title', title],
      ['name', 'twitter:description', meta.description],
      ['name', 'twitter:image', meta.image],
      ['name', 'twitter:image:alt', meta.imageAlt],
    ].map(
      ([attribute, key, value]) =>
        `<meta data-rh="true" ${attribute}="${key}" content="${escapeHtml(value)}" />`,
    ),
    ...nationalProjectsStructuredData.map(
      (data) =>
        `<script data-rh="true" type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`,
    ),
  ].join('\n');
  const html = template
    .replace(/<title>[\s\S]*?<\/title>/i, '')
    .replace(
      /<meta\b[^>]*(?:property="og:[^"]*"|name="(?:twitter:[^"]*|description|keywords)")[^>]*>/gi,
      '',
    )
    .replace(/<link\b[^>]*rel="canonical"[^>]*>/gi, '')
    .replace('</head>', `${tags}\n</head>`);
  const intro = `<main style="max-width:960px;margin:32px auto;padding:24px;font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
    <a href="/transparency">BetterBacolod Transparency</a>
    <p>Proposed FY2027 · DPWH · Negros Island Region</p>
    <h1>What’s proposed for your district?</h1>
    <p>${escapeHtml(meta.description)}</p>
    <h2>NIR district leaderboard and project explorer</h2>
    <p>Find representatives and their associated DPWH offices across Bacolod City, Negros Occidental, Negros Oriental, and Siquijor. Explore the largest proposed projects and compare the Executive’s National Expenditure Program with the House bill.</p>
    <p>These are proposed amounts, not money already spent. Office amounts do not establish who requested a project. Shared-office figures remain undivided.</p>
    <p>The interactive leaderboard, project search, and charts load live data when JavaScript is enabled.</p>
    <p>Source: <a href="https://budget.bettergov.ph/hgab/2027/sources">BetterGov Budget source documents and methodology</a>.</p>
  </main>`;
  if (!html.includes('<div id="root"></div>'))
    throw new Error(
      'Vite root markup changed; update the route SEO generator.',
    );
  return html.replace('<div id="root"></div>', `<div id="root">${intro}</div>`);
}

export function writeNationalProjectsHtml() {
  const directory = 'dist/transparency/national-projects';
  mkdirSync(directory, { recursive: true });
  writeFileSync(
    `${directory}/index.html`,
    renderNationalProjectsHtml(readFileSync('dist/index.html', 'utf8')),
  );
}
