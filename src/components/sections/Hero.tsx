import {
  Briefcase,
  Bus,
  FileText,
  GraduationCap,
  Heart,
  Search,
  Trash2,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { serviceCategories } from '../../data/yamlLoader';
import { Heading } from '../ui/Heading';
import { Text } from '../ui/Text';

interface ServiceCategory {
  category: string;
  slug: string;
  description: string;
  subcategories?: { name: string; slug: string }[];
}

export default function Hero() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const allItems = useMemo(() => {
    const items: { title: string; href: string }[] = [];
    (serviceCategories.categories as ServiceCategory[]).forEach((cat) => {
      items.push({ title: cat.category, href: `/services/${cat.slug}` });
      cat.subcategories?.forEach((sub) => {
        items.push({ title: sub.name, href: `/services/${cat.slug}` });
      });
    });
    // Officials
    const officials = [
      'Mayor Greg Gasataya',
      'Vice Mayor Claudio Puentevella',
      'Congressman Albee Benitez',
      'Councilor Caesar Distrito',
      'Councilor Israel Salanga',
      'Councilor Em Ang',
      'Councilor Jude Thaddeus Sayson',
      'Councilor Al Espino',
      'Councilor Dindo Ramos',
      'Councilor Bobby Rojas',
      'Councilor Jason Villarosa',
      'Councilor Homer Bais',
      'Councilor Wilson Gamboa Jr.',
      'Councilor Celia Flor',
      'Councilor Pao Sy',
    ];
    officials.forEach((o) => items.push({ title: o, href: '/government' }));
    // Departments
    const depts = [
      'City Health Office',
      'City Engineering Office',
      'City Treasurer Office',
      'City Assessor Office',
      'PESO Bacolod',
      'Business Permits and Licensing',
      'City Civil Registry',
      'CDRRMO',
      'City Social Welfare',
      'City Agriculture Office',
      'City Budget Office',
      'City Accounting Office',
      'City Legal Office',
      'City Planning and Development',
      'City Environment Office',
      'City Veterinary Office',
      'Public Information Office',
      'Human Resource Management Office',
    ];
    depts.forEach((d) => items.push({ title: d, href: '/government' }));
    // Barangays
    const brgys = [
      'Alijis',
      'Banago',
      'Bata',
      'Cabug',
      'Estefania',
      'Felisa',
      'Granada',
      'Handumanan',
      'Mandalagan',
      'Mansilingan',
      'Montevista',
      'Pahanocoy',
      'Punta Taytay',
      'Singcang-Airport',
      'Sum-ag',
      'Taculing',
      'Tangub',
      'Villamonte',
      'Vista Alegre',
      'Barangay 1',
      'Barangay 2',
      'Barangay 3',
      'Barangay 4',
      'Barangay 5',
      'Barangay 6',
      'Barangay 7',
      'Barangay 8',
      'Barangay 9',
      'Barangay 10',
      'Barangay 11',
      'Barangay 12',
      'Barangay 13',
      'Barangay 14',
      'Barangay 15',
      'Barangay 16',
      'Barangay 17',
      'Barangay 18',
      'Barangay 19',
      'Barangay 20',
      'Barangay 21',
      'Barangay 22',
      'Barangay 23',
      'Barangay 24',
      'Barangay 25',
      'Barangay 26',
      'Barangay 27',
      'Barangay 28',
      'Barangay 29',
      'Barangay 30',
      'Barangay 31',
      'Barangay 32',
      'Barangay 33',
      'Barangay 34',
      'Barangay 35',
      'Barangay 36',
      'Barangay 37',
      'Barangay 38',
      'Barangay 39',
      'Barangay 40',
      'Barangay 41',
    ];
    brgys.forEach((b) =>
      items.push({ title: `Barangay ${b}`, href: '/government' }),
    );
    // Pages & Info
    items.push(
      { title: 'City Officials', href: '/government' },
      { title: 'City Departments', href: '/government' },
      { title: 'All Barangays', href: '/government' },
      { title: 'Flood Control Projects', href: '/transparency' },
      { title: 'Budget Information', href: '/transparency' },
      { title: 'Procurement PhilGEPS', href: '/transparency' },
      { title: 'Emergency Hotlines', href: '/about' },
      { title: 'About Bacolod City', href: '/about' },
      { title: 'MassKara Festival', href: '/about' },
      { title: 'City of Smiles', href: '/about' },
      { title: '911 Emergency', href: '/about' },
    );
    return items;
  }, []);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return allItems
      .filter((i) => i.title.toLowerCase().includes(q))
      .slice(0, 6);
  }, [searchQuery, allItems]);

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
              {t('hero.subtitle')}
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
                    onFocus={() => setShowDropdown(true)}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                    placeholder="Search services, permits, information..."
                    className="w-full pl-10 pr-4 py-2.5 text-sm text-gray-900 bg-white border-2 border-primary-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 placeholder-gray-400 transition-all"
                  />
                  {showDropdown && filtered.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 overflow-hidden">
                      {filtered.map((item, i) => (
                        <Link
                          key={i}
                          to={item.href}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700"
                          onClick={() => setShowDropdown(false)}
                        >
                          {item.title}
                        </Link>
                      ))}
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
