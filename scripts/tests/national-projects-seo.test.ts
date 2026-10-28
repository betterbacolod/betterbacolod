import { describe, expect, test } from 'bun:test';
import { nationalProjectsMetadata } from '../../src/features/transparency/national-projects/metadata';
import { renderNationalProjectsHtml } from '../national-projects-seo';

describe('national projects crawler HTML', () => {
  test('replaces generic metadata and supplies crawlable content without JavaScript', () => {
    const html = renderNationalProjectsHtml(
      '<html><head><title>Homepage</title><meta property="og:title" content="Homepage" /><meta property="og:image:width" content="1080" /></head><body><div id="root"></div><script src="/app.js"></script></body></html>',
    );
    expect(html.match(/<title>/g)).toHaveLength(1);
    expect(html.match(/property="og:title"/g)).toHaveLength(1);
    expect(html).toContain(nationalProjectsMetadata.image);
    expect(html).toContain('name="twitter:card" content="summary_large_image"');
    expect(html).toContain('property="og:image:width" content="1080"');
    expect(html).toContain(
      'rel="canonical" href="https://betterbacolod.org/transparency/national-projects"',
    );
    expect(html).toContain('<h1>What’s proposed for your district?</h1>');
    expect(html).toContain('"@type":"BreadcrumbList"');
    expect(html).toContain('"@type":"CollectionPage"');
    expect(html).toContain('<script src="/app.js"></script>');
    expect(html).not.toContain('content="Homepage"');
  });
});
