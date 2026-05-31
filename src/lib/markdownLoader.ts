/**
 * Utility to load markdown content dynamically based on slug
 */

import {
  type Category,
  findDocumentCategory,
  type Subcategory,
} from '../data/yamlLoader';

export interface MarkdownContent {
  content: string;
  title?: string;
  description?: string;
  category?: Category;
  subcategory?: Subcategory;
}

/**
 * Loads markdown content from the content/category directory
 * @param documentSlug - The document slug (filename without .md extension)
 * @returns Promise with markdown content
 */
export async function loadMarkdownContent(
  documentSlug: string,
): Promise<MarkdownContent> {
  try {
    // Find the category slug from the YAML data
    const match = await findDocumentCategory(documentSlug);

    if (!match) {
      throw new Error(`Category not found for document slug: ${documentSlug}`);
    }

    // Import the markdown file dynamically from the services directory
    // Construct the path using the category slug and document slug
    const module = await import(
      `../../content/services/${match.category.slug}/${documentSlug}.md?raw`
    );
    const content = module.default;

    // Extract title from the first heading (# Title)
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : undefined;

    // Extract description from the first paragraph after the title
    const descriptionMatch = content.match(/^#\s+.+$\n\n(.+?)(?:\n\n|$)/s);
    const description = descriptionMatch
      ? descriptionMatch[1].replace(/^>\s*/, '').trim()
      : undefined;

    return {
      content,
      title,
      description,
      category: match.category,
      subcategory: match.subcategory,
    };
  } catch (error) {
    console.error(
      `Failed to load markdown content for document: ${documentSlug}`,
      error,
    );
    throw new Error(`Document not found: ${documentSlug}`);
  }
}
