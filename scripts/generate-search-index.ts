import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { create, insert, save } from '@orama/orama';
import yaml from 'js-yaml';

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
      title: 'Transparency',
      description: 'Flood control projects, budget, procurement data',
      content: 'flood drainage dpwh infrastructure project budget transparency',
      url: '/transparency',
      category: 'Transparency',
      type: 'page',
    },
  ];

  for (const page of pages) {
    await insert(db, page);
  }

  // Save index to dist (after vite build)
  const index = await save(db);
  writeFileSync('dist/search-index.json', JSON.stringify(index));

  console.log(
    `✅ Indexed ${indexed} pages + ${servicesData.categories.length} categories`,
  );
}

generateSearchIndex().catch(console.error);
