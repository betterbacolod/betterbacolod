import { Highlight } from '@orama/highlight';
import { search as oramaSearch } from '@orama/orama';
import {
  Briefcase,
  Bus,
  FileText,
  GraduationCap,
  Heart,
  Search,
  Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getSearchDB, initializeSearch } from '../../lib/searchIndex';
import { Heading } from '../ui/Heading';
import { Text } from '../ui/Text';

const highlighter = new Highlight();

export default function Hero() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<
    Array<{ title: string; url: string }>
  >([]);
  const [dbReady, setDbReady] = useState(false);

  // Get Orama suggestions
  useEffect(() => {
    if (!dbReady || !searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    const performSearch = async () => {
      const db = getSearchDB();
      if (!db) return;

      const results = await oramaSearch(db, {
        term: searchQuery,
        limit: 6,
        tolerance: 1,
      });

      setSuggestions(
        results.hits.map((hit) => ({
          title: hit.document.title as string,
          url: hit.document.url as string,
        })),
      );
    };

    performSearch();
  }, [searchQuery, dbReady]);

  const [showDropdown, setShowDropdown] = useState(false);
  const [hasFocused, setHasFocused] = useState(false);

  // Defer search index loading until user focuses on search input
  const handleSearchFocus = () => {
    setShowDropdown(true);
    if (!hasFocused) {
      setHasFocused(true);
      initializeSearch().then(() => setDbReady(true));
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowDropdown(false);
    }
  };

  const quickActions = [
    {
      label: 'Business',
      icon: Briefcase,
      path: '/services/business',
      color: 'text-blue-600',
    },
    {
      label: 'Health',
      icon: Heart,
      path: '/services/health-services',
      color: 'text-red-600',
    },
    {
      label: 'Education',
      icon: GraduationCap,
      path: '/services/education',
      color: 'text-green-600',
    },
    {
      label: 'Waste',
      icon: Trash2,
      path: '/services/garbage-waste-disposal',
      color: 'text-emerald-600',
    },
    {
      label: 'Transport',
      icon: Bus,
      path: '/services/transportation',
      color: 'text-orange-600',
    },
    {
      label: 'Documents',
      icon: FileText,
      path: '/services/legal-civil',
      color: 'text-purple-600',
    },
  ];

  return (
    <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-10 md:py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Left section with title */}
          <div className="animate-fade-in">
            <Text
              transform="uppercase"
              className="text-primary-100 text-xs font-semibold tracking-wider mb-2"
            >
              Welcome to
            </Text>
            <Heading className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
              BetterBacolod.org
            </Heading>
            <Text className="text-base md:text-lg text-primary-50 leading-relaxed mb-4">
              Your community portal for Bacolod City government services and
              information
            </Text>
            <p className="text-sm text-primary-100 leading-relaxed">
              Access government services, permits, and information for Bacolod
              City residents and businesses.
            </p>
          </div>

          {/* Right section with search box */}
          <div className="animate-fade-in">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-5">
              <h3 className="text-base font-bold text-gray-900 mb-3">
                Search Services
              </h3>

              <form onSubmit={handleSearch} className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowDropdown(true);
                    }}
                    onFocus={handleSearchFocus}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                    placeholder="Search services, permits, information..."
                    className="w-full pl-10 pr-4 py-2.5 text-sm text-gray-900 bg-white border-2 border-primary-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 placeholder-gray-400 transition-all"
                  />
                  {showDropdown && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 overflow-hidden">
                      {suggestions.map((item, i) => {
                        const highlighted = highlighter.highlight(
                          item.title,
                          searchQuery,
                        ).HTML;
                        return (
                          <Link
                            key={i}
                            to={item.url}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 [&_mark]:bg-primary-100 [&_mark]:text-primary-700 [&_mark]:px-1 [&_mark]:rounded"
                            onClick={() => setShowDropdown(false)}
                          >
                            <span
                              // biome-ignore lint/security/noDangerouslySetInnerHtml: Orama highlight output is safe
                              dangerouslySetInnerHTML={{ __html: highlighted }}
                            />
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              </form>

              <div className="border-t border-gray-100 pt-4">
                <h4 className="text-sm font-bold text-gray-900 mb-3">
                  Popular Services
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {quickActions.map((action) => (
                    <button
                      key={action.label}
                      onClick={() => navigate(action.path)}
                      className="flex flex-col items-center gap-1.5 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all hover:shadow-md group"
                    >
                      <action.icon
                        className={`h-5 w-5 ${action.color} group-hover:scale-110 transition-transform`}
                      />
                      <span className="text-xs font-medium text-gray-700">
                        {action.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
