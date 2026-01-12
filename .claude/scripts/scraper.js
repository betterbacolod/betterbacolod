#!/usr/bin/env node

/**
 * Bacolod Government Website Scraper
 * Extracts content, FB links, and portal links from official sources
 *
 * Usage:
 *   node scraper.js --url "https://bacolodcity.gov.ph/page"
 *   node scraper.js --checklist "../docs/bacolod/SCRAPING-CHECKLIST.md" --category health
 */

import fs from 'node:fs';
import http from 'node:http';
import https from 'node:https';
import path from 'node:path';
import { fileURLToPath, URL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CLI Arguments Parser
const args = process.argv.slice(2);
const config = {
  url: getArg('--url'),
  checklist: getArg('--checklist'),
  category: getArg('--category'),
  output:
    getArg('--output') ||
    path.join(__dirname, '../../docs/bacolod/BACOLOD-DATA-COLLECTION.md'),
  append: args.includes('--append'),
  extractFb: args.includes('--extract-fb'),
  extractPortals: args.includes('--extract-portals'),
  verifyLinks: args.includes('--verify-links'),
  crawl: getArg('--crawl'),
  maxDepth: parseInt(getArg('--max-depth') || '2', 10),
  maxPages: parseInt(getArg('--max-pages') || '50', 10),
};

function getArg(flag) {
  const index = args.indexOf(flag);
  return index > -1 && args[index + 1] ? args[index + 1] : null;
}

// Main
async function main() {
  console.log('🕷️  Bacolod Website Scraper\n');

  if (!config.url && !config.checklist && !config.crawl) {
    console.error('❌ Error: Must provide --url, --checklist, or --crawl');
    console.log('\nUsage:');
    console.log('  node scraper.js --url "https://bacolodcity.gov.ph/page"');
    console.log(
      '  node scraper.js --checklist "path/to/checklist.md" --category health',
    );
    console.log(
      '  node scraper.js --crawl "https://bacolodcity.gov.ph" --max-depth 2',
    );
    process.exit(1);
  }

  try {
    let results = [];

    if (config.url) {
      console.log(`Scraping single page: ${config.url}`);
      const result = await scrapePage(config.url);
      results.push(result);
    } else if (config.checklist) {
      console.log(`Reading checklist: ${config.checklist}`);
      const urls = await parseChecklist(config.checklist, config.category);
      console.log(`Found ${urls.length} URLs to scrape\n`);

      for (const url of urls) {
        console.log(`Scraping: ${url}`);
        const result = await scrapePage(url);
        results.push(result);
        await sleep(1000); // Be nice to the server
      }
    } else if (config.crawl) {
      console.log(`Crawling site: ${config.crawl}`);
      results = await crawlSite(config.crawl, config.maxDepth, config.maxPages);
    }

    // Save results
    console.log(`\n📝 Saving results to: ${config.output}`);
    await saveResults(results, config.output, config.append);

    console.log('\n✅ Scraping complete!');
    console.log(`   Pages scraped: ${results.length}`);
    console.log(`   Output file: ${config.output}`);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Scrape a single page
async function scrapePage(url) {
  const html = await fetchPage(url);
  const data = parseHTML(html, url);

  if (config.extractFb) {
    data.facebookLinks = extractFacebookLinks(html, url);
  }

  if (config.extractPortals) {
    data.portalLinks = extractPortalLinks(html, url);
  }

  return data;
}

// Fetch page content
function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    protocol
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}: ${url}`));
          return;
        }

        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve(data));
      })
      .on('error', reject);
  });
}

// Simple HTML parser (basic extraction without external deps)
function parseHTML(html, url) {
  const data = {
    url,
    scrapedDate: new Date().toISOString().split('T')[0],
    title: extractTitle(html),
    content: extractContent(html),
    contactInfo: extractContactInfo(html),
    requirements: extractLists(html, ['requirement', 'needed', 'documents']),
    process: extractLists(html, ['process', 'step', 'procedure', 'how to']),
    downloadLinks: extractDownloadLinks(html, url),
  };

  return data;
}

function extractTitle(html) {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) return cleanText(titleMatch[1]);

  const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  if (h1Match) return cleanText(h1Match[1]);

  return 'Untitled Page';
}

function extractContent(html) {
  // Extract main content area (basic heuristic)
  const mainMatch =
    html.match(/<main[^>]*>([\s\S]*?)<\/main>/i) ||
    html.match(/<article[^>]*>([\s\S]*?)<\/article>/i) ||
    html.match(/<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i);

  if (!mainMatch) return '';

  const content = mainMatch[1];

  // Extract paragraphs
  const paragraphs = [];
  const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  let match;

  while ((match = pRegex.exec(content)) !== null) {
    const text = cleanText(stripHTML(match[1]));
    if (text.length > 20) paragraphs.push(text);
  }

  return paragraphs.join('\n\n');
}

function extractContactInfo(html) {
  const contact = {
    phones: [],
    emails: [],
    addresses: [],
  };

  // Phone numbers: (034) XXX-XXXX or 034-XXX-XXXX
  const phoneRegex = /\(?\d{3}\)?\s?-?\d{3}-\d{4}/g;
  const phones = html.match(phoneRegex) || [];
  contact.phones = [...new Set(phones)];

  // Emails: *@*.gov.ph
  const emailRegex = /[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.gov\.ph/gi;
  const emails = html.match(emailRegex) || [];
  contact.emails = [...new Set(emails.map((e) => e.toLowerCase()))];

  // Hours (basic pattern)
  const hoursMatch = html.match(
    /([Mm]onday|[Tt]uesday|[Ww]ednesday|[Tt]hursday|[Ff]riday)[^<]{0,50}(\d{1,2}:\d{2}|\d{1,2}\s?[AP]M)/i,
  );
  if (hoursMatch) {
    contact.hours = cleanText(hoursMatch[0]);
  }

  return contact;
}

function extractLists(html, keywords) {
  const items = [];

  // Look for lists near keywords
  for (const keyword of keywords) {
    const regex = new RegExp(
      `${keyword}[\\s\\S]{0,200}(<ul[^>]*>[\\s\\S]*?</ul>|<ol[^>]*>[\\s\\S]*?</ol>)`,
      'gi',
    );
    const matches = html.match(regex);

    if (matches) {
      matches.forEach((match) => {
        const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
        let liMatch;

        while ((liMatch = liRegex.exec(match)) !== null) {
          const text = cleanText(stripHTML(liMatch[1]));
          if (text.length > 5) items.push(text);
        }
      });
    }
  }

  return [...new Set(items)];
}

function extractFacebookLinks(html, sourceUrl) {
  const fbLinks = [];
  const fbRegex =
    /https?:\/\/(www\.)?(facebook|fb)\.(com|me)\/[a-zA-Z0-9._-]+/gi;
  const matches = html.match(fbRegex) || [];

  for (const link of matches) {
    const normalized = link.replace(/\/(posts|photos|videos|about).*$/, '');

    fbLinks.push({
      url: normalized,
      verification: sourceUrl.includes('.gov.ph')
        ? 'Linked from .gov.ph'
        : 'Unverified',
      confidence: sourceUrl.includes('.gov.ph') ? 'High' : 'Low',
    });
  }

  // Deduplicate
  const unique = {};
  fbLinks.forEach((link) => {
    unique[link.url] = link;
  });

  return Object.values(unique);
}

function extractPortalLinks(html, sourceUrl) {
  const portals = [];
  const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match;

  while ((match = linkRegex.exec(html)) !== null) {
    const href = match[1];
    const text = cleanText(stripHTML(match[2]));

    // Check if it's a portal/government link
    if (
      href.includes('.gov.ph') ||
      href.includes('.gov') ||
      (href.includes('online') && href.includes('service')) ||
      href.includes('portal')
    ) {
      const fullUrl = resolveUrl(href, sourceUrl);

      portals.push({
        url: fullUrl,
        text: text || 'Link',
        type: categorizePortalLink(fullUrl, text),
      });
    }
  }

  // Deduplicate
  const unique = {};
  portals.forEach((link) => {
    unique[link.url] = link;
  });

  return Object.values(unique);
}

function extractDownloadLinks(html, sourceUrl) {
  const downloads = [];
  const linkRegex =
    /<a[^>]+href=["']([^"']+\.(pdf|doc|docx|xls|xlsx))["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match;

  while ((match = linkRegex.exec(html)) !== null) {
    const href = match[1];
    const ext = match[2];
    const text = cleanText(stripHTML(match[3]));

    const fullUrl = resolveUrl(href, sourceUrl);

    downloads.push({
      url: fullUrl,
      filename: path.basename(new URL(fullUrl).pathname),
      type: ext.toUpperCase(),
      text: text || 'Download',
    });
  }

  return downloads;
}

function categorizePortalLink(url, text) {
  const lower = `${url} ${text}`.toLowerCase();

  if (lower.includes('online') && lower.includes('service'))
    return 'Online Services';
  if (lower.includes('portal')) return 'Portal';
  if (lower.includes('form')) return 'Forms';
  if (lower.includes('application')) return 'Application';
  if (lower.includes('permit')) return 'Permits';
  if (lower.includes('registration')) return 'Registration';

  return 'Government Link';
}

function resolveUrl(href, baseUrl) {
  try {
    return new URL(href, baseUrl).href;
  } catch {
    return href;
  }
}

function stripHTML(text) {
  return text.replace(/<[^>]*>/g, '');
}

function cleanText(text) {
  return text
    .replace(/\s+/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .trim();
}

// Parse checklist file for URLs
async function parseChecklist(checklistPath, category) {
  const content = fs.readFileSync(checklistPath, 'utf-8');
  const urls = [];
  const lines = content.split('\n');

  let inCategory = !category; // If no category specified, get all

  for (const line of lines) {
    // Check for category headers
    if (category && line.startsWith('###')) {
      inCategory = line.toLowerCase().includes(category.toLowerCase());
    }

    // Extract URLs
    if (inCategory) {
      const urlMatch = line.match(/https?:\/\/[^\s)]+/);
      if (urlMatch) {
        urls.push(urlMatch[0]);
      }
    }
  }

  return urls;
}

// Save results to markdown
async function saveResults(results, outputFile, append) {
  const markdown = results.map(formatAsMarkdown).join('\n\n---\n\n');

  if (append && fs.existsSync(outputFile)) {
    fs.appendFileSync(outputFile, `\n\n${markdown}`);
  } else {
    const header = `# Bacolod Data Collection\n\n> Last updated: ${new Date().toISOString().split('T')[0]}\n\n---\n\n`;
    fs.writeFileSync(outputFile, header + markdown);
  }
}

function formatAsMarkdown(data) {
  let md = `## ${data.title}\n\n`;
  md += `**URL:** ${data.url}\n`;
  md += `**Scraped:** ${data.scrapedDate}\n\n`;

  if (data.content) {
    md += `### Content\n\n${data.content}\n\n`;
  }

  if (data.requirements && data.requirements.length > 0) {
    md += `### Requirements\n\n`;
    data.requirements.forEach((req) => (md += `- ${req}\n`));
    md += '\n';
  }

  if (data.process && data.process.length > 0) {
    md += `### Process\n\n`;
    data.process.forEach((step, i) => (md += `${i + 1}. ${step}\n`));
    md += '\n';
  }

  if (data.contactInfo) {
    const { phones, emails, hours } = data.contactInfo;

    if (phones.length > 0 || emails.length > 0 || hours) {
      md += `### Contact Information\n\n`;

      if (phones.length > 0) {
        md += `- **Phone:** ${phones.join(', ')}\n`;
      }
      if (emails.length > 0) {
        md += `- **Email:** ${emails.join(', ')}\n`;
      }
      if (hours) {
        md += `- **Hours:** ${hours}\n`;
      }
      md += '\n';
    }
  }

  if (data.portalLinks && data.portalLinks.length > 0) {
    md += `### Portal Links\n\n`;
    data.portalLinks.forEach((link) => {
      md += `- [${link.text}](${link.url}) - ${link.type}\n`;
    });
    md += '\n';
  }

  if (data.facebookLinks && data.facebookLinks.length > 0) {
    md += `### Facebook Pages\n\n`;
    data.facebookLinks.forEach((link) => {
      md += `- [Facebook Page](${link.url})\n`;
      md += `  - Verification: ${link.verification}\n`;
      md += `  - Confidence: ${link.confidence}\n`;
    });
    md += '\n';
  }

  if (data.downloadLinks && data.downloadLinks.length > 0) {
    md += `### Downloads\n\n`;
    data.downloadLinks.forEach((link) => {
      md += `- [${link.text}](${link.url}) (${link.type})\n`;
    });
    md += '\n';
  }

  return md;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Crawl site (basic implementation)
async function crawlSite(startUrl, maxDepth, maxPages) {
  console.log(`Crawling with max depth ${maxDepth} and max ${maxPages} pages`);

  const visited = new Set();
  const results = [];
  const queue = [{ url: startUrl, depth: 0 }];

  while (queue.length > 0 && visited.size < maxPages) {
    const { url, depth } = queue.shift();

    if (visited.has(url) || depth > maxDepth) continue;

    console.log(`[${visited.size + 1}/${maxPages}] Depth ${depth}: ${url}`);

    try {
      const html = await fetchPage(url);
      const data = parseHTML(html, url);

      if (config.extractFb)
        data.facebookLinks = extractFacebookLinks(html, url);
      if (config.extractPortals)
        data.portalLinks = extractPortalLinks(html, url);

      results.push(data);
      visited.add(url);

      // Find more links to crawl (only from same domain)
      if (depth < maxDepth) {
        const links = extractInternalLinks(html, url);
        links.forEach((link) => {
          if (!visited.has(link)) {
            queue.push({ url: link, depth: depth + 1 });
          }
        });
      }

      await sleep(1000); // Be nice to the server
    } catch (error) {
      console.error(`  ❌ Failed: ${error.message}`);
    }
  }

  return results;
}

function extractInternalLinks(html, baseUrl) {
  const links = [];
  const baseHost = new URL(baseUrl).host;
  const linkRegex = /<a[^>]+href=["']([^"']+)["']/gi;
  let match;

  while ((match = linkRegex.exec(html)) !== null) {
    try {
      const fullUrl = new URL(match[1], baseUrl);

      // Only same-host links
      if (fullUrl.host === baseHost && fullUrl.protocol.startsWith('http')) {
        // Remove fragments and query params for deduplication
        fullUrl.hash = '';
        links.push(fullUrl.href);
      }
    } catch {}
  }

  return [...new Set(links)];
}

// Run
main();
