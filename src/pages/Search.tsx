import { search as oramaSearch } from '@orama/orama';
import { FileText, Search as SearchIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import SEO from '../components/SEO';
import { Heading } from '../components/ui/Heading';
import Section from '../components/ui/Section';
import { getSearchDB, initializeSearch } from '../lib/searchIndex';

interface SearchResult {
  id: string;
  score: number;
  document: {
    title: string;
    description: string;
    url: string;
    category: string;
    type: string;
  };
}

const Search: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [dbReady, setDbReady] = useState(false);

  // Initialize Orama on mount
  useEffect(() => {
    initializeSearch().then(() => setDbReady(true));
  }, []);

  // Update query from URL
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) setQuery(q);
  }, [searchParams]);

  // Search with Orama
  useEffect(() => {
    if (!dbReady || !query.trim()) {
      setResults([]);
      return;
    }

    const performSearch = async () => {
      setLoading(true);
      try {
        const db = getSearchDB();
        if (!db) return;

        const searchResults = await oramaSearch(db, {
          term: query,
          limit: 20,
          tolerance: 1,
        });

        setResults(searchResults.hits);
      } catch (err) {
        console.error('Search error:', err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [query, dbReady]);

  const suggestions = useMemo(
    () => [
      'birth certificate',
      'business permit',
      'barangay clearance',
      'cedula',
      'senior citizen',
      'pwd id',
    ],
    [],
  );

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
              placeholder="Search services, officials, barangays..."
              className="w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              disabled={!dbReady}
            />
          </div>

          {loading && (
            <p className="text-sm text-gray-500 mb-4">Searching...</p>
          )}

          {!loading && query && (
            <p className="text-sm text-gray-500 mb-4">
              {results.length} result{results.length !== 1 ? 's' : ''} for "
              {query}"
            </p>
          )}

          <div className="space-y-2">
            {results.map((hit, i) => (
              <Link
                key={i}
                to={hit.document.url}
                className="block p-4 bg-white border rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-1 text-gray-400">
                    <FileText className="h-4 w-4" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900">
                      {hit.document.title}
                    </div>
                    {hit.document.description && (
                      <div className="text-sm text-gray-500 line-clamp-2">
                        {hit.document.description}
                      </div>
                    )}
                    <div className="text-xs text-gray-400 mt-1">
                      {hit.document.category}
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded flex-shrink-0">
                    {hit.document.type}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {query && results.length === 0 && !loading && (
            <div className="text-center py-12 text-gray-500">
              No results found for "{query}"
            </div>
          )}

          {!query && (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">Start typing to search</p>
              <div className="flex flex-wrap justify-center gap-2">
                {suggestions.map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    type="button"
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
