import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { load } from 'js-yaml';
import { seoGuides } from '../../src/data/seoGuides';

const readContent = (name: string) =>
  readFileSync(
    new URL(`../../content/services/transportation/${name}`, import.meta.url),
    'utf8',
  );
const transportSlug = 'check-public-transport-routes-and-schedules';
const airportSlug = 'bacolod-silay-airport';
const transport = readContent(`${transportSlug}.md`);
const airport = readContent(`${airportSlug}.md`);
const category = load(readContent('index.yaml')) as {
  pages: { name: string; slug: string; description: string }[];
};
const landing = seoGuides.find(
  (guide) => guide.path === '/bacolod-transportation',
);

describe('transport guide source and link consistency', () => {
  test('keeps both service names searchable and uses verified store identifiers', () => {
    const indexedContent = transport.substring(0, 2000);
    expect(indexedContent).toContain('Lagaw.ph');
    expect(indexedContent).toContain('formerly Commute Bacolod');
    expect(indexedContent).toContain('https://lagaw.ph/');
    expect(indexedContent).toContain('https://apps.apple.com/app/id6793345740');
    expect(indexedContent).toContain(
      'https://play.google.com/store/apps/details?id=com.commutebacolod.mobile',
    );
    expect(transport).not.toContain('https://www.commutebacolod.com/');
    expect(transport).not.toContain('https://twitter.com/CommuteBacolod');
  });

  test('removes unsupported real-time claims and unsourced fixed fares', () => {
    const copy = `${transport}\n${airport}\n${JSON.stringify(category)}\n${JSON.stringify(landing)}`;
    expect(copy).not.toMatch(/real[- ]time (?:transit|route|jeepney|bus)/i);
    expect(copy).not.toMatch(/most comprehensive/i);
    expect(`${transport}\n${airport}`).not.toMatch(/₱\s*\d/);
    expect(transport).toContain('https://ltfrb.gov.ph/');
  });

  test('attributes ferry terminal and city contact information to primary sources', () => {
    expect(transport).toContain('BREDCO Port 2');
    expect(transport).toContain('https://oceanjet.net/contact-us');
    expect(transport).toContain('https://oceanjet.net/travel-advisories');
    expect(transport).toContain('mailto:btao@bacolodcity.gov.ph');
    expect(transport).toContain('https://bacolodcity.gov.ph/contact-us/');
    expect(transport).not.toContain('operates Banago Port');
    expect(transport).not.toContain('bttmd@bacolodcity.gov.ph');
  });

  test('uses airline and CAAP links instead of unverified airport details', () => {
    for (const url of [
      'https://www.caap.gov.ph/area-centers/',
      'https://www.cebupacificair.com/',
      'https://www.philippineairlines.com/',
      'https://www.airasia.com/',
    ]) {
      expect(airport).toContain(url);
    }
    expect(airport).not.toContain('basiaairportshuttle.wordpress.com');
    expect(airport).not.toContain('wikipedia.org');
    expect(airport).not.toMatch(/435-(?:1591|2011|2448)/);
    expect(airport).not.toMatch(/counters open 3 hours/i);
    expect(airport).not.toContain('| Destinations');
  });

  test('preserves guide URLs and aligns category and SEO link labels', () => {
    expect(landing).toBeDefined();
    for (const slug of [transportSlug, airportSlug]) {
      const card = category.pages.find((page) => page.slug === slug);
      const link = landing?.primaryLinks.find(
        (item) => item.href === `/transportation/${slug}`,
      );
      expect(card).toBeDefined();
      expect(link?.label).toBe(card?.name);
    }
    expect(landing?.intro).toContain('formerly Commute Bacolod');
    expect(transport).toContain(`](/transportation/${airportSlug})`);
    expect(airport).toContain(`](/transportation/${transportSlug})`);
  });

  test('dates both reviews and keeps limitations visible', () => {
    for (const guide of [transport, airport]) {
      expect(guide).toMatch(
        /\*\*Last reviewed:\*\* [A-Z][a-z]+ \d{1,2}, \d{4}/,
      );
      expect(guide).toContain('## Sources and Review Notes');
    }
    expect(transport).toContain('this page is not a route planner');
    expect(airport).toContain('does not provide live flight data');
  });
});
