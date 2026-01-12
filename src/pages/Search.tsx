import {
  Building2,
  FileText,
  MapPin,
  Search as SearchIcon,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import SEO from '../components/SEO';
import { Heading } from '../components/ui/Heading';
import Section from '../components/ui/Section';
import { serviceCategories } from '../data/yamlLoader';

interface SearchResult {
  title: string;
  description: string;
  href: string;
  type: 'Service' | 'Page' | 'Info';
  keywords?: string;
}

interface ServiceCategory {
  category: string;
  slug: string;
  description: string;
  subcategories?: { name: string; slug: string; description?: string }[];
}

const Search: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) setQuery(q);
  }, [searchParams]);

  const allItems = useMemo(() => {
    const items: SearchResult[] = [];

    // Services with subcategories
    (serviceCategories.categories as ServiceCategory[]).forEach((cat) => {
      items.push({
        title: cat.category,
        description: cat.description,
        href: `/services/${cat.slug}`,
        type: 'Service',
        keywords: cat.category.toLowerCase(),
      });
      cat.subcategories?.forEach((sub) => {
        items.push({
          title: sub.name,
          description: sub.description || `${cat.category} - ${sub.name}`,
          href: `/services/${cat.slug}`,
          type: 'Service',
          keywords: `${cat.category} ${sub.name}`.toLowerCase(),
        });
      });
    });

    // Main pages
    items.push(
      {
        title: 'City Officials',
        description: 'Mayor, Vice Mayor, Congressman, City Councilors',
        href: '/government',
        type: 'Page',
        keywords: 'mayor vice mayor councilor officials government',
      },
      {
        title: 'City Departments',
        description:
          '35 departments including City Health, Engineering, Treasury',
        href: '/government',
        type: 'Page',
        keywords: 'department office city hall treasury health engineering',
      },
      {
        title: 'Barangays',
        description: '61 barangays with captain contact information',
        href: '/government',
        type: 'Page',
        keywords: 'barangay captain brgy village',
      },
      {
        title: 'Flood Control Projects',
        description: '39 DPWH flood control projects in Bacolod (2021-2024)',
        href: '/transparency',
        type: 'Page',
        keywords: 'flood drainage dpwh infrastructure project',
      },
      {
        title: 'Budget Information',
        description: 'Region VI General Appropriations Act data',
        href: '/transparency',
        type: 'Page',
        keywords: 'budget gaa appropriation spending',
      },
      {
        title: 'Procurement',
        description: 'PhilGEPS bidding and procurement data',
        href: '/transparency',
        type: 'Page',
        keywords: 'procurement bid philgeps contract',
      },
      {
        title: 'About Bacolod City',
        description: 'City of Smiles - population, history, MassKara Festival',
        href: '/about',
        type: 'Page',
        keywords: 'about bacolod city smiles masskara history',
      },
      {
        title: 'Emergency Hotlines',
        description: '911, CDRRMO, PNP, City Hall contact numbers',
        href: '/about',
        type: 'Info',
        keywords: 'hotline emergency 911 cdrrmo police fire',
      },
      {
        title: 'Birth Certificate',
        description:
          'Request or get copy of birth certificate from Civil Registry',
        href: '/services/civil-registry',
        type: 'Service',
        keywords: 'birth certificate psa civil registry baby born',
      },
      {
        title: 'Death Certificate',
        description: 'Request death certificate from Civil Registry',
        href: '/services/civil-registry',
        type: 'Service',
        keywords: 'death certificate civil registry deceased',
      },
      {
        title: 'Marriage Certificate',
        description: 'Request marriage certificate from Civil Registry',
        href: '/services/civil-registry',
        type: 'Service',
        keywords: 'marriage certificate wedding civil registry kasal',
      },
      {
        title: 'Barangay Clearance',
        description: 'Get barangay clearance for employment or business',
        href: '/government',
        type: 'Service',
        keywords: 'barangay clearance brgy certificate employment',
      },
      {
        title: 'Real Property Tax',
        description: 'Pay real property tax at City Treasurer Office',
        href: '/services/tax-services',
        type: 'Service',
        keywords: 'real property tax amilyar land tax treasurer',
      },
      {
        title: 'Community Tax Certificate (Cedula)',
        description: 'Get cedula or community tax certificate',
        href: '/services/tax-services',
        type: 'Service',
        keywords: 'cedula community tax certificate ctc',
      },
      {
        title: 'Building Permit',
        description: 'Apply for building permit at City Engineering Office',
        href: '/services/permits-licensing',
        type: 'Service',
        keywords: 'building permit construction obo engineering',
      },
      {
        title: 'Senior Citizen ID',
        description: 'Apply for senior citizen ID and benefits',
        href: '/services/social-services',
        type: 'Service',
        keywords: 'senior citizen id osca elderly',
      },
      {
        title: 'PWD ID',
        description: 'Apply for Person with Disability ID',
        href: '/services/social-services',
        type: 'Service',
        keywords: 'pwd id disability person with disability',
      },
    );

    return items;
  }, []);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return allItems
      .filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.keywords?.includes(q),
      )
      .slice(0, 25);
  }, [query, allItems]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'Service':
        return <FileText className="h-4 w-4" />;
      case 'Page':
        return <Building2 className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  return (
    <>
      <SEO
        title="Search"
        description="Search BetterBacolod for services and information"
        keywords="search, Bacolod, services, government"
      />
      <Section className="min-h-[60vh]">
        <div className="max-w-2xl mx-auto">
          <Heading level={2} className="text-center mb-6">
            Search
          </Heading>

          <div className="relative mb-6">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Try: business permit, health, barangay, flood..."
              className="w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {query && (
            <p className="text-sm text-gray-500 mb-4">
              {results.length} result{results.length !== 1 ? 's' : ''} for "
              {query}"
            </p>
          )}

          <div className="space-y-2">
            {results.map((item, i) => (
              <Link
                key={i}
                to={item.href}
                className="block p-4 bg-white border rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-1 text-gray-400">
                    {getIcon(item.type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900">
                      {item.title}
                    </div>
                    <div className="text-sm text-gray-500 line-clamp-2">
                      {item.description}
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded flex-shrink-0">
                    {item.type}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {query && results.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No results found for "{query}"
            </div>
          )}

          {!query && (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">Start typing to search</p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  'birth certificate',
                  'business permit',
                  'mayor',
                  'barangay clearance',
                  'health center',
                  'real property tax',
                ].map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-primary-100 text-gray-600 hover:text-primary-700 rounded-full transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </Section>
    </>
  );
};

export default Search;
