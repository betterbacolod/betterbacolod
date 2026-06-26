import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { create, insert, save } from '@orama/orama';
import yaml from 'js-yaml';
import { seoGuides } from '../src/data/seoGuides';

const schema = {
  title: 'string',
  description: 'string',
  content: 'string',
  url: 'string',
  category: 'string',
  type: 'string',
} as const;

async function generateSearchIndex() {
  console.log('🔍 Generating search index...');

  const db = await create({ schema });

  // Load service categories
  const servicesYaml = readFileSync('src/data/services.yaml', 'utf-8');
  const servicesData = yaml.load(servicesYaml) as {
    categories: Array<{ category: string; slug: string; description: string }>;
  };

  // Index service categories
  for (const cat of servicesData.categories) {
    await insert(db, {
      title: cat.category,
      description: cat.description,
      content: `${cat.category} ${cat.description}`,
      url: `/services/${cat.slug}`,
      category: cat.category,
      type: 'service',
    });
  }

  // Index all markdown files
  const servicesDir = 'content/services';
  const categories = readdirSync(servicesDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  let indexed = 0;
  const servicePageUrls: string[] = [];
  for (const category of categories) {
    const categoryPath = join(servicesDir, category);
    const files = readdirSync(categoryPath).filter((f) => f.endsWith('.md'));

    for (const file of files) {
      const filePath = join(categoryPath, file);
      const content = readFileSync(filePath, 'utf-8');
      const slug = file.replace('.md', '');

      // Extract title from first # heading
      const titleMatch = content.match(/^#\s+(.+)$/m);
      const title = titleMatch
        ? titleMatch[1].replace(/—.*$/, '').trim()
        : slug;

      // Extract description (first paragraph after title)
      const lines = content.split('\n');
      let description = '';
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('#')) continue;
        if (lines[i].trim() && !lines[i].startsWith('---')) {
          description = lines[i].substring(0, 200);
          break;
        }
      }

      await insert(db, {
        title,
        description,
        content: content.substring(0, 2000),
        url: `/${category}/${slug}`,
        category: category.replace(/-/g, ' '),
        type: 'page',
      });
      servicePageUrls.push(`/${category}/${slug}`);
      indexed++;
    }
  }

  // Index main pages
  const pages = [
    {
      title: 'Government',
      description: 'City officials, departments, and 61 barangays',
      content:
        'mayor vice mayor councilor officials government departments barangay',
      url: '/government',
      category: 'Government',
      type: 'page',
    },
    {
      title: 'Energy',
      description:
        'Visayas grid demand, NIR power plant capacity, and Negros Power feeder coverage',
      content:
        'energy electricity power Visayas grid demand Negros Island Region NIR power plants DOE installed dependable capacity Negros Power feeder coverage feeder area Bacolod barangay Hilangban Burgos Reclamation Sum-ag Murcia Panaogao Talisay Mt View Lopez Alijis Asdes Gonzaga HF BF RF SF MuF PF TF MF LF AF AGF',
      url: '/energy',
      category: 'Energy',
      type: 'page',
    },
    {
      title: 'Transparency',
      description: 'Flood control projects, budget, procurement data',
      content: 'flood drainage dpwh infrastructure project budget transparency',
      url: '/transparency',
      category: 'Transparency',
      type: 'page',
    },
    {
      title: 'Fuel Price Watch',
      description: 'Weekly DOE retail fuel prices in Bacolod City',
      content:
        'fuel prices gas gasoline diesel kerosene petroleum DOE pump price weekly Bacolod RON 91 95 97',
      url: '/transparency',
      category: 'Transparency',
      type: 'page',
    },
  ];

  for (const page of pages) {
    await insert(db, page);
  }

  for (const guide of seoGuides) {
    await insert(db, {
      title: guide.title,
      description: guide.description,
      content: `${guide.heading} ${guide.intro} ${guide.primaryLinks
        .map((link) => `${link.label} ${link.description}`)
        .join(' ')}`,
      url: guide.path,
      category: 'Bacolod Guides',
      type: 'guide',
    });
  }

  // Save index to dist (after vite build)
  const index = await save(db);
  writeFileSync('dist/search-index.json', JSON.stringify(index));
  writeFileSync(
    'dist/sitemap.xml',
    buildSitemap({
      categoryUrls: servicesData.categories.map(
        (category) => `/services/${category.slug}`,
      ),
      guideUrls: seoGuides.map((guide) => guide.path),
      servicePageUrls,
    }),
  );

  console.log(
    `✅ Indexed ${indexed} pages + ${servicesData.categories.length} categories + ${seoGuides.length} guides`,
  );
}

generateSearchIndex().catch(console.error);

function buildSitemap({
  categoryUrls,
  guideUrls,
  servicePageUrls,
}: {
  categoryUrls: string[];
  guideUrls: string[];
  servicePageUrls: string[];
}) {
  const siteUrl = 'https://betterbacolod.org';
  const lastmod = new Date().toISOString().slice(0, 10);
  const urls = [
    { loc: '/', priority: '1.0' },
    { loc: '/services', priority: '0.9' },
    { loc: '/energy', priority: '0.8' },
    { loc: '/government', priority: '0.9' },
    { loc: '/transparency', priority: '0.9' },
    { loc: '/about', priority: '0.7' },
    { loc: '/sitemap', priority: '0.5' },
    ...guideUrls.map((loc) => ({ loc, priority: '0.8' })),
    ...categoryUrls.map((loc) => ({ loc, priority: '0.7' })),
    ...servicePageUrls.map((loc) => ({ loc, priority: '0.6' })),
  ];

  const body = urls
    .map(
      ({ loc, priority }) =>
        `  <url><loc>${siteUrl}${loc}</loc><lastmod>${lastmod}</lastmod><priority>${priority}</priority></url>`,
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}
