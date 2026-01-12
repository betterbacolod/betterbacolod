import * as LucideIcons from 'lucide-react';
import { Link } from 'react-router-dom';
import { serviceCategories } from '../../data/yamlLoader';
import { useTranslation } from '../../hooks/useTranslation';
import { Card, CardContent } from '../ui/Card';
import { Heading } from '../ui/Heading';
import Section from '../ui/Section';
import { Text } from '../ui/Text';

interface Subcategory {
  name: string;
  slug: string;
}

interface Category {
  category: string;
  slug: string;
  subcategories: Subcategory[];
  description: string;
  icon: string;
}

export default function ServicesSection({
  title,
  description,
}: {
  title?: string;
  description?: string;
}) {
  const { t } = useTranslation();

  const getIcon = (category: string) => {
    const IconComponent = LucideIcons[
      category as keyof typeof LucideIcons
    ] as React.ComponentType<{ className?: string }>;
    return IconComponent ? <IconComponent className="h-6 w-6" /> : null;
  };

  const displayedCategories = serviceCategories.categories as Category[];

  return (
    <Section>
      <div className="text-center mb-10">
        <Heading level={2}>{title || t('services.title')}</Heading>
        <Text className="text-gray-600 max-w-2xl mx-auto">
          {description || t('services.description')}
        </Text>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {displayedCategories.map((category) => (
          <Link key={category.slug} to={`/services/${category.slug}`}>
            <Card hoverable className="border-t-4 border-primary-500 h-full">
              <CardContent className="flex flex-col h-full p-6">
                <div className="flex gap-2">
                  <div className="bg-primary-100 text-primary-600 p-3 rounded-md mb-4 self-start">
                    {getIcon(category.icon)}
                  </div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 self-center">
                    {category.category}
                  </h3>
                </div>
                <Text className="text-gray-800">{category.description}</Text>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </Section>
  );
}
