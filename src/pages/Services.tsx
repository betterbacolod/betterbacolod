import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ServicesSection from '../components/home/ServicesSection';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import { Heading } from '../components/ui/Heading';
import ListItem from '../components/ui/ListItem';
import Section from '../components/ui/Section';
import { Text } from '../components/ui/Text';
import {
  getCategorySubcategories,
  type Subcategory,
  serviceCategories,
} from '../data/yamlLoader';
import { getCategoryIcon } from '../lib/categoryIcons';

const Services: React.FC = () => {
  const { category } = useParams();
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(false);

  const getCategory = () => {
    return serviceCategories.categories.find((c) => c.slug === category);
  };

  const categoryData = getCategory();
  const Icon = getCategoryIcon(categoryData?.icon);
  const categoryGuideMap: Record<string, { label: string; href: string }> = {
    'health-services': {
      label: 'Bacolod Health Services guide',
      href: '/bacolod-health-services',
    },
    education: {
      label: 'Bacolod Scholarships guide',
      href: '/bacolod-scholarships',
    },
    transportation: {
      label: 'Bacolod Transportation guide',
      href: '/bacolod-transportation',
    },
    'legal-civil': {
      label: 'Bacolod Government Services guide',
      href: '/bacolod-government-services',
    },
  };
  const relatedGuide = category ? categoryGuideMap[category] : undefined;

  useEffect(() => {
    if (category && categoryData) {
      setLoading(true);
      getCategorySubcategories(category)
        .then(setSubcategories)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [category, categoryData]);

  if (!category) {
    return (
      <>
        <SEO
          title="Bacolod City Services"
          description="Browse Bacolod City government service guides for permits, health, education, business, legal documents, transport, social welfare, and more."
          keywords="Bacolod City services, Bacolod government services, Bacolod permits, Bacolod public services"
          url="/services"
        />
        <ServicesSection
          title={`All local government services`}
          description={`All services provided by the ${import.meta.env.VITE_GOVERNMENT_NAME} government. Find what you need for citizenship, business, education, and more.`}
        />
      </>
    );
  }
  if (!categoryData) {
    return (
      <Section className="p-3 mb-12">
        <Breadcrumbs className="mb-8" />
        <div className="flex flex-col items-center justify-center h-full p-6">
          <Heading level={2}>Category not found</Heading>
          <Text className="text-gray-600 mb-6">
            The category you are looking for does not exist.
          </Text>
        </div>
      </Section>
    );
  }

  return (
    <>
      <SEO
        title={`Bacolod ${categoryData.category || category}`}
        description={`${categoryData.description} Find Bacolod City service guides, requirements, and related local information.`}
        keywords={`Bacolod ${categoryData.category}, Bacolod services, government services, public services, local government`}
        url={`/services/${category}`}
      />
      <Section className="p-3 mb-12">
        <Breadcrumbs className="mb-8" />
        {Icon && <Icon className="h-8 w-8 mb-4 text-primary-600 rounded-md" />}
        <Heading>{categoryData.category || category}</Heading>
        <Text className="text-gray-600 mb-6">{categoryData.description}</Text>
        {relatedGuide && (
          <Link
            to={relatedGuide.href}
            className="inline-flex mb-6 text-sm text-primary-600 hover:underline"
          >
            Related guide: {relatedGuide.label}
          </Link>
        )}

        {loading ? (
          <div className="flex justify-center items-center p-8">
            <Text>Loading services...</Text>
          </div>
        ) : (
          <div className="space-y-4">
            {subcategories.map((subcategory) => (
              <ListItem
                key={subcategory.slug}
                title={subcategory.name}
                category={categoryData.category || category}
                description={subcategory.description || ''}
                href={`/${subcategory.slug}`}
              />
            ))}
          </div>
        )}
      </Section>
    </>
  );
};

export default Services;
