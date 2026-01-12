import * as LucideIcons from 'lucide-react';
import { Link } from 'react-router-dom';
import { governmentActivitCategories } from '../../data/yamlLoader';
import { useTranslation } from '../../hooks/useTranslation';
import { Card, CardContent } from '../ui/Card';
import { Heading } from '../ui/Heading';
import Section from '../ui/Section';
import { Text } from '../ui/Text';

interface Category {
  category: string;
  slug: string;
  description: string;
  icon: string;
}

export default function GovernmentActivitySection() {
  const { t } = useTranslation();

  const getIcon = (category: string) => {
    const IconComponent = LucideIcons[
      category as keyof typeof LucideIcons
    ] as React.ComponentType<{ className?: string }>;
    return IconComponent ? <IconComponent className="h-6 w-6" /> : null;
  };

  const displayedCategories =
    governmentActivitCategories.categories as Category[];

  return (
    <Section>
      <Heading level={2}>{t('governmentActivity.title')}</Heading>
      <Text className="text-gray-600 mb-6">
        {t('governmentActivity.description')}
      </Text>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {displayedCategories.map((category) => (
          <Link key={category.slug} to={`/government?section=${category.slug}`}>
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
