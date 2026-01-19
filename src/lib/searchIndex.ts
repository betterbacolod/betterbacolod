import { create, insert, type Orama } from '@orama/orama';
import { serviceCategories } from '../data/yamlLoader';

let searchDB: Orama<typeof schema> | null = null;

const schema = {
  title: 'string',
  description: 'string',
  content: 'string',
  url: 'string',
  category: 'string',
  type: 'string',
} as const;

export async function initializeSearch() {
  if (searchDB) return searchDB;

  searchDB = await create({ schema });

  // Index service categories
  for (const cat of serviceCategories.categories) {
    await insert(searchDB, {
      title: cat.category,
      description: cat.description,
      content: `${cat.category} ${cat.description}`,
      url: `/services/${cat.slug}`,
      category: cat.category,
      type: 'service',
    });

    // Index subcategories
    if (cat.subcategories) {
      for (const sub of cat.subcategories) {
        await insert(searchDB, {
          title: sub.name,
          description: sub.description || '',
          content: `${sub.name} ${sub.description || ''} ${cat.category}`,
          url: `/services/${cat.slug}`,
          category: cat.category,
          type: 'service',
        });
      }
    }
  }

  // Index main pages
  const pages = [
    {
      title: 'City Officials',
      description: 'Mayor, Vice Mayor, Congressman, City Councilors',
      content:
        'mayor vice mayor councilor officials government greg gasataya claudio puentevella albee benitez',
      url: '/government',
      category: 'Government',
    },
    {
      title: 'City Departments',
      description:
        '35 departments including City Health, Engineering, Treasury',
      content:
        'department office city hall treasury health engineering bplo peso civil registry',
      url: '/government',
      category: 'Government',
    },
    {
      title: 'Barangays',
      description: '61 barangays with captain contact information',
      content:
        'barangay captain brgy village alijis banago bata mandalagan singcang taculing tangub villamonte',
      url: '/government',
      category: 'Government',
    },
    {
      title: 'Transparency',
      description: 'Flood control projects, budget, procurement data',
      content:
        'flood drainage dpwh infrastructure project budget gaa appropriation spending procurement bid philgeps',
      url: '/transparency',
      category: 'Transparency',
    },
  ];

  for (const page of pages) {
    await insert(searchDB, {
      ...page,
      type: 'page',
    });
  }

  return searchDB;
}

export function getSearchDB() {
  return searchDB;
}
