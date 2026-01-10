import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Briefcase,
  Heart,
  Trash2,
  Bus,
  FileText,
  GraduationCap,
} from 'lucide-react';
import { Heading } from '../ui/Heading';
import { Text } from '../ui/Text';

export default function Hero() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
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
      path: '/services',
      color: 'text-purple-600',
    },
  ];

  return (
    <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-12 md:py-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left section with title */}
          <div className="animate-fade-in">
            <Text
              transform="uppercase"
              className="text-primary-100 text-sm font-semibold tracking-wider mb-3"
            >
              Welcome to
            </Text>
            <Heading className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              {import.meta.env.VITE_GOVERNMENT_NAME}
            </Heading>
            <Text className="text-lg md:text-xl text-primary-50 leading-relaxed mb-6">
              {t('hero.subtitle')}
            </Text>
            <p className="text-base text-primary-100 leading-relaxed">
              Access government services, permits, and information for Bacolod
              City residents and businesses.
            </p>
          </div>

          {/* Right section with search box */}
          <div className="animate-fade-in">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Search Services
              </h3>

              <form onSubmit={handleSearch} className="mb-5">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search services, permits, information..."
                    className="w-full pl-11 pr-4 py-3 text-sm text-gray-900 bg-white border-2 border-primary-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 placeholder-gray-400 transition-all"
                  />
                </div>
              </form>

              <div className="border-t border-gray-100 pt-4">
                <h4 className="text-sm font-bold text-gray-900 mb-3">
                  Popular Services
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {quickActions.map(action => (
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
