import yaml from 'js-yaml';

// Type definitions for the services data
export interface Subcategory {
  name: string;
  slug: string;
  description?: string;
}

export interface Category {
  category: string;
  slug: string;
  description: string;
  icon: string;
  subcategories?: Subcategory[]; // Keep for backward compatibility
}

export interface CategoryData {
  categories: Category[];
  description: string;
}

export interface CategoryIndexData {
  pages: Subcategory[];
}

export interface DocumentCategoryMatch {
  category: Category;
  subcategory: Subcategory;
}

import governmentActivitiesYamlContent from './government.yaml?raw';
// Import the YAML file as raw text
import servicesYamlContent from './services.yaml?raw';

const categoryIndexModules = import.meta.glob<string>(
  '../../content/services/*/index.yaml',
  {
    query: '?raw',
    import: 'default',
    eager: true,
  },
);

// Create a mapping of existing category index files to their YAML content.
const categoryIndexMap: { [key: string]: string } = Object.fromEntries(
  Object.entries(categoryIndexModules).map(([path, content]) => {
    const slug = path.match(/content\/services\/([^/]+)\/index\.yaml$/)?.[1];
    return [slug || path, content];
  }),
);

// Parse the YAML content
export const serviceCategories: CategoryData = yaml.load(
  servicesYamlContent,
) as CategoryData;

export const governmentActivitCategories: CategoryData = yaml.load(
  governmentActivitiesYamlContent,
) as CategoryData;

// Function to load category index data
export async function loadCategoryIndex(
  categorySlug: string,
): Promise<Subcategory[]> {
  try {
    // Use the statically imported YAML content from the mapping
    const yamlContent = categoryIndexMap[categorySlug];

    if (!yamlContent) {
      console.warn(`Category ${categorySlug} not found in categoryIndexMap`);
      return [];
    }

    const indexData: CategoryIndexData = yaml.load(
      yamlContent,
    ) as CategoryIndexData;
    return indexData.pages || [];
  } catch (error) {
    console.error(`Error loading category index for ${categorySlug}:`, error);
    return [];
  }
}

// Function to get subcategories for a category (with caching)
const categoryCache = new Map<string, Subcategory[]>();

export async function getCategorySubcategories(
  categorySlug: string,
): Promise<Subcategory[]> {
  if (categoryCache.has(categorySlug)) {
    return categoryCache.get(categorySlug)!;
  }

  const subcategories = await loadCategoryIndex(categorySlug);
  categoryCache.set(categorySlug, subcategories);
  return subcategories;
}

export async function findDocumentCategory(
  documentSlug: string,
): Promise<DocumentCategoryMatch | null> {
  for (const category of serviceCategories.categories) {
    if (category.subcategories) {
      const subcategory = category.subcategories.find(
        (sub) => sub.slug === documentSlug,
      );

      if (subcategory) {
        return { category, subcategory };
      }
    }

    const subcategories = await getCategorySubcategories(category.slug);
    const subcategory = subcategories.find((sub) => sub.slug === documentSlug);

    if (subcategory) {
      return { category, subcategory };
    }
  }

  return null;
}
