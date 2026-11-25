import { existsSync, readFileSync } from 'node:fs';
import { siteMetadata, siteStructuredData } from '../src/data/siteMetadata';

export function readSpaTemplate() {
  return readFileSync(
    existsSync('dist/spa.html') ? 'dist/spa.html' : 'dist/index.html',
    'utf8',
  );
}

export const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (char) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        char
      ]!,
  );

interface PageMetadata {
  title?: string;
  description: string;
  url: string;
  keywords?: string;
  image?: string;
  imageAlt?: string;
  imageWidth?: number;
  imageHeight?: number;
}

export function renderPageHtml(
  template: string,
  meta: PageMetadata,
  content: string,
  structuredData: Record<string, unknown>[] = [],
) {
  const title = meta.title
    ? `${meta.title} | ${siteMetadata.name}`
    : siteMetadata.title;
  const canonical = `${siteMetadata.url}${meta.url}`;
  const image = meta.image ?? siteMetadata.image;
  const tags = [
    `<title>${escapeHtml(title)}</title>`,
    `<link data-rh="true" rel="canonical" href="${canonical}" />`,
    ...[
      ['name', 'description', meta.description],
      [
        'name',
        'keywords',
        meta.keywords ?? 'Bacolod City services, public data, transparency',
      ],
      ['property', 'og:title', title],
      ['property', 'og:description', meta.description],
      ['property', 'og:url', canonical],
      ['property', 'og:type', 'website'],
      ['property', 'og:site_name', siteMetadata.name],
      ['property', 'og:image', image],
      ['property', 'og:image:alt', meta.imageAlt ?? siteMetadata.imageAlt],
      ['property', 'og:image:width', String(meta.imageWidth ?? 1080)],
      ['property', 'og:image:height', String(meta.imageHeight ?? 1080)],
      ['name', 'twitter:card', 'summary_large_image'],
      ['name', 'twitter:title', title],
      ['name', 'twitter:description', meta.description],
      ['name', 'twitter:image', image],
      ['name', 'twitter:image:alt', meta.imageAlt ?? siteMetadata.imageAlt],
    ].map(
      ([attribute, key, value]) =>
        `<meta data-rh="true" ${attribute}="${key}" content="${escapeHtml(value)}" />`,
    ),
    ...[...siteStructuredData, ...structuredData].map(
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
  if (!html.includes('<div id="root"></div>'))
    throw new Error(
      'Vite root markup changed; update the route SEO generator.',
    );
  return html.replace(
    '<div id="root"></div>',
    `<div id="root">${content}</div>`,
  );
}
