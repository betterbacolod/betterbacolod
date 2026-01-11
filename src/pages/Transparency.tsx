import { useState } from 'react';
import Section from '../components/ui/Section';
import { Heading } from '../components/ui/Heading';
import { Text } from '../components/ui/Text';
import { Card, CardContent } from '../components/ui/Card';
import SEO from '../components/SEO';
import {
  ChevronRight,
  Droplets,
  Building2,
  FileText,
  ExternalLink,
  TrendingUp,
  FileSearch,
  FolderOpen,
  ShoppingCart,
} from 'lucide-react';
import FloodControlSection from '../components/transparency/FloodControlSection';
import budgetData from '../data/transparency/budget-region6.json';

const categories = [
  {
    slug: 'flood-control',
    name: 'Flood Control Projects',
    icon: Droplets,
    description: '39 DPWH flood control projects in Bacolod City',
  },
  {
    slug: 'reports',
    name: 'Budget & Procurement',
    icon: FileText,
    description: 'Regional budget allocation and government contracts',
  },
  {
    slug: 'infrastructure',
    name: 'Infrastructure (DIME)',
    icon: Building2,
    description: 'Major infrastructure projects tracking',
  },
];

const Transparency: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const handleSectionClick = (slug: string) => {
    setActiveSection(activeSection === slug ? null : slug);
  };

  const renderContent = () => {
    if (activeSection === 'flood-control') return <FloodControlSection />;
    if (activeSection === 'infrastructure') return <InfrastructureSection />;
    if (activeSection === 'reports') return <ReportsSection />;
    return null;
  };

  return (
    <>
      <SEO
        title="Transparency"
        description="Government transparency data for Bacolod City - flood control projects, infrastructure, procurement, and public reports."
        keywords="transparency, flood control, infrastructure, procurement, Bacolod City, DPWH"
      />
      <Section className="min-h-[60vh]">
        <div className="text-center mb-6 md:mb-10">
          <Heading level={2}>Transparency</Heading>
          <Text className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
            Access public data on government projects, budgets, and procurement
            in Bacolod City.
          </Text>
        </div>

        {/* Mobile: List Tiles */}
        <div className="lg:hidden space-y-2">
          {categories.map(cat => {
            const Icon = cat.icon;
            const isActive = activeSection === cat.slug;
            return (
              <div key={cat.slug}>
                <button
                  className={`w-full flex items-center gap-4 p-4 rounded-lg border text-left transition-colors ${
                    isActive
                      ? 'border-primary-500 bg-primary-50 rounded-b-none'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                  onClick={() => handleSectionClick(cat.slug)}
                >
                  <div
                    className={`p-2 rounded-lg ${isActive ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{cat.name}</h3>
                  </div>
                  <ChevronRight
                    className={`h-5 w-5 text-gray-400 transition-transform ${isActive ? 'rotate-90' : ''}`}
                  />
                </button>
                {isActive && (
                  <Card className="rounded-t-none border-t-0 border-primary-500">
                    <CardContent className="p-4">{renderContent()}</CardContent>
                  </Card>
                )}
              </div>
            );
          })}
        </div>

        {/* Desktop: Card Grid + Content Below */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-3 gap-6">
            {categories.map(cat => {
              const Icon = cat.icon;
              const isActive = activeSection === cat.slug;
              return (
                <Card
                  key={cat.slug}
                  hoverable
                  className={`border-t-4 cursor-pointer transition-all ${isActive ? 'border-primary-600 ring-2 ring-primary-200' : 'border-primary-500'}`}
                  onClick={() => handleSectionClick(cat.slug)}
                >
                  <CardContent className="flex flex-col h-full p-6">
                    <div className="flex gap-3 items-start">
                      <div
                        className={`p-3 rounded-md ${isActive ? 'bg-primary-600 text-white' : 'bg-primary-100 text-primary-600'}`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {cat.name}
                        </h3>
                        <Text className="text-gray-600 text-sm mt-1">
                          {cat.description}
                        </Text>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {activeSection && (
            <Card className="mt-8">
              <CardContent className="p-6">{renderContent()}</CardContent>
            </Card>
          )}
        </div>
      </Section>
    </>
  );
};

// Infrastructure Section - Links to BetterGov DIME
const InfrastructureSection = () => (
  <div className="space-y-4">
    <p className="text-gray-600 text-sm">
      Track major infrastructure projects through the DPWH Digital Information
      for Monitoring and Evaluation (DIME) system. Data is loaded live from the
      DPWH database.
    </p>

    <div className="flex flex-wrap gap-2">
      <a
        href="https://visualizations.bettergov.ph/dime?city=BACOLOD+CITY"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-600 text-white rounded text-sm hover:bg-primary-700"
      >
        Bacolod City Projects <ExternalLink className="h-3 w-3" />
      </a>
      <a
        href="https://visualizations.bettergov.ph/dime?province=NEGROS+OCCIDENTAL"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 px-3 py-1.5 border border-primary-600 text-primary-600 rounded text-sm hover:bg-primary-50"
      >
        Negros Occidental <ExternalLink className="h-3 w-3" />
      </a>
    </div>

    <p className="text-xs text-gray-500">
      Source:{' '}
      <a
        href="https://dime.dpwh.gov.ph"
        target="_blank"
        rel="noopener noreferrer"
        className="underline"
      >
        DPWH DIME
      </a>{' '}
      via{' '}
      <a
        href="https://bettergov.ph"
        target="_blank"
        rel="noopener noreferrer"
        className="underline"
      >
        BetterGov.ph
      </a>{' '}
      • Report issues:{' '}
      <a
        href="https://sumbongsapangulo.ph/"
        target="_blank"
        rel="noopener noreferrer"
        className="underline"
      >
        sumbongsapangulo.ph
      </a>
    </p>
  </div>
);

// Reports Section - Budget & Procurement
const ReportsSection = () => (
  <div className="space-y-6">
    {/* Procurement */}
    <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <ShoppingCart className="h-4 w-4 text-primary-600" />
        <h3 className="text-sm font-semibold text-primary-800 uppercase tracking-wide">
          Government Procurement
        </h3>
      </div>
      <p className="text-sm text-primary-700 mb-3">
        View all government bids, awards, and contracts in Negros Occidental.
        Track how public funds are spent.
      </p>
      <div className="flex flex-wrap gap-2">
        <a
          href="https://transparency.bettergov.ph/locations/Negros%20Occidental"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-600 text-white rounded text-sm hover:bg-primary-700"
        >
          View Negros Occidental Procurement{' '}
          <ExternalLink className="h-3 w-3" />
        </a>
        <a
          href="https://www.philgeps.gov.ph"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-3 py-1.5 border border-primary-600 text-primary-700 rounded text-sm hover:bg-primary-100"
        >
          PhilGEPS Portal <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>

    {/* Budget Chart */}
    <div>
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-300">
        <TrendingUp className="h-4 w-4 text-gray-600" />
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
          Region VI Budget (GAA)
        </h3>
      </div>
      <p className="text-xs text-gray-500 mb-3">
        General Appropriations Act allocation for Western Visayas (includes
        Bacolod City)
      </p>
      <div className="space-y-2">
        {budgetData.data.slice(-4).map(item => (
          <div key={item.year} className="flex items-center gap-3">
            <span className="text-sm text-gray-600 w-12">{item.year}</span>
            <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
              <div
                className="bg-primary-500 h-full rounded-full flex items-center justify-end pr-2"
                style={{ width: `${(item.gaa / 200000000000) * 100}%` }}
              >
                <span className="text-xs text-white font-medium">
                  ₱{(item.gaa / 1e9).toFixed(0)}B
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <a
        href="https://transparency.bettergov.ph/budget/regional"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-xs text-primary-600 hover:underline mt-2"
      >
        View full budget data <ExternalLink className="h-3 w-3" />
      </a>
    </div>

    {/* Audit & Accountability */}
    <div>
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-300">
        <FileSearch className="h-4 w-4 text-gray-600" />
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
          Audit & Accountability
        </h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <a
          href="https://www.coa.gov.ph"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
        >
          <div className="p-2 bg-primary-100 rounded-lg text-primary-600">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <p className="font-medium text-gray-900 text-sm">
              COA Audit Reports
            </p>
            <p className="text-xs text-gray-500">
              Commission on Audit findings
            </p>
          </div>
        </a>
        <a
          href="https://www.foi.gov.ph"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
        >
          <div className="p-2 bg-primary-100 rounded-lg text-primary-600">
            <FolderOpen className="h-4 w-4" />
          </div>
          <div>
            <p className="font-medium text-gray-900 text-sm">
              Freedom of Information
            </p>
            <p className="text-xs text-gray-500">
              Request government documents
            </p>
          </div>
        </a>
      </div>
    </div>

    <p className="text-xs text-gray-500 pt-2">
      Source:{' '}
      <a
        href="https://dbm.gov.ph"
        target="_blank"
        rel="noopener noreferrer"
        className="underline"
      >
        DBM
      </a>{' '}
      via{' '}
      <a
        href="https://bettergov.ph"
        target="_blank"
        rel="noopener noreferrer"
        className="underline"
      >
        BetterGov.ph
      </a>{' '}
      • Report issues:{' '}
      <a
        href="https://sumbongsapangulo.ph/"
        target="_blank"
        rel="noopener noreferrer"
        className="underline"
      >
        sumbongsapangulo.ph
      </a>
    </p>
  </div>
);

export default Transparency;
