import Section from '../components/ui/Section';
import { Heading } from '../components/ui/Heading';
import { Text } from '../components/ui/Text';
import { governmentActivitCategories } from '../data/yamlLoader';
import * as LucideIcons from 'lucide-react';
import SEO from '../components/SEO';
import { Card, CardContent } from '../components/ui/Card';
import { useState } from 'react';
import OfficialsSection from '../components/government/OfficialsSection';
import DepartmentsSection from '../components/government/DepartmentsSection';
import BarangaysSection from '../components/government/BarangaysSection';
import { ChevronRight, Search } from 'lucide-react';

const Government: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSectionClick = (slug: string) => {
    const isActive = activeSection === slug;
    setActiveSection(isActive ? null : slug);
    setSearchQuery('');
  };

  const renderContent = () => {
    if (activeSection === 'officials')
      return <OfficialsSection searchQuery={searchQuery} />;
    if (activeSection === 'departments')
      return <DepartmentsSection searchQuery={searchQuery} />;
    if (activeSection === 'barangays')
      return <BarangaysSection searchQuery={searchQuery} />;
    return null;
  };

  return (
    <>
      <SEO
        title="Government"
        description="Learn about Bacolod City government - officials, departments, and barangays."
        keywords="government, city officials, departments, barangays, Bacolod City"
      />
      <Section className="min-h-[60vh]">
        <div className="text-center mb-6 md:mb-10">
          <Heading level={2}>Bacolod City Government</Heading>
          <Text className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
            Learn about your city officials, government departments, and
            barangays.
          </Text>
        </div>

        {/* Mobile: List Tiles */}
        <div className="lg:hidden space-y-2">
          {governmentActivitCategories.categories.map(cat => {
            const CatIcon = LucideIcons[
              cat.icon as keyof typeof LucideIcons
            ] as React.ComponentType<{ className?: string }>;
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
                    {CatIcon && <CatIcon className="h-5 w-5" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {cat.category}
                    </h3>
                  </div>
                  <ChevronRight
                    className={`h-5 w-5 text-gray-400 transition-transform ${isActive ? 'rotate-90' : ''}`}
                  />
                </button>
                {isActive && (
                  <Card className="rounded-t-none border-t-0 border-primary-500">
                    <CardContent className="p-4">
                      <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder={`Search ${cat.category.toLowerCase()}...`}
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      {renderContent()}
                    </CardContent>
                  </Card>
                )}
              </div>
            );
          })}
        </div>

        {/* Desktop: Card Grid + Content Below */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-3 gap-6">
            {governmentActivitCategories.categories.map(cat => {
              const CatIcon = LucideIcons[
                cat.icon as keyof typeof LucideIcons
              ] as React.ComponentType<{ className?: string }>;
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
                        {CatIcon && <CatIcon className="h-6 w-6" />}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {cat.category}
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
              <CardContent className="p-6">
                <div className="relative mb-6 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={`Search...`}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                {renderContent()}
              </CardContent>
            </Card>
          )}
        </div>
      </Section>
    </>
  );
};

export default Government;
