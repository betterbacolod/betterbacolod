import Section from '../components/ui/Section';
import { Heading } from '../components/ui/Heading';
import { Text } from '../components/ui/Text';
import { governmentActivitCategories } from '../data/yamlLoader';
import * as LucideIcons from 'lucide-react';
import SEO from '../components/SEO';
import { Card, CardContent } from '../components/ui/Card';
import { useState, useRef, useEffect } from 'react';
import OfficialsSection from '../components/government/OfficialsSection';
import DepartmentsSection from '../components/government/DepartmentsSection';
import BarangaysSection from '../components/government/BarangaysSection';

const Government: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Scroll to content on mobile when section is selected
  useEffect(() => {
    if (activeSection && contentRef.current && window.innerWidth < 768) {
      setTimeout(() => {
        contentRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 100);
    }
  }, [activeSection]);

  const renderContent = () => {
    if (activeSection === 'officials') return <OfficialsSection />;
    if (activeSection === 'departments') return <DepartmentsSection />;
    if (activeSection === 'barangays') return <BarangaysSection />;
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

        {/* Category Cards - smaller on mobile */}
        <div className="grid grid-cols-3 md:grid-cols-3 gap-2 md:gap-6">
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
                onClick={() => setActiveSection(isActive ? null : cat.slug)}
              >
                <CardContent className="flex flex-col h-full p-3 md:p-6">
                  {/* Mobile: stacked, Desktop: side by side */}
                  <div className="flex flex-col md:flex-row md:gap-2 items-center md:items-start">
                    <div
                      className={`p-2 md:p-3 rounded-md mb-2 md:mb-4 ${isActive ? 'bg-primary-600 text-white' : 'bg-primary-100 text-primary-600'}`}
                    >
                      {CatIcon && <CatIcon className="h-5 w-5 md:h-6 md:w-6" />}
                    </div>
                    <h3 className="text-xs md:text-lg font-semibold text-gray-900 text-center md:text-left md:self-center">
                      {cat.category}
                    </h3>
                  </div>
                  {/* Hide description on mobile */}
                  <Text className="text-gray-800 hidden md:block">
                    {cat.description}
                  </Text>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Content Section */}
        {activeSection && (
          <div ref={contentRef} className="mt-6 md:mt-8 scroll-mt-4">
            <Card>
              <CardContent className="p-4 md:p-6">
                {renderContent()}
              </CardContent>
            </Card>
          </div>
        )}
      </Section>
    </>
  );
};

export default Government;
