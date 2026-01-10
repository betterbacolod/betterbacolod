import { useTranslation } from 'react-i18next';
import { Heading } from '../ui/Heading';
import { Text } from '../ui/Text';

export default function Hero() {
  const { t } = useTranslation();
  return (
    <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-12 md:py-24">
      <div className="container mx-auto px-4">
        <div className="flex justify-center items-center">
          <div className="animate-fade-in text-center max-w-3xl">
            <Text transform="uppercase">Welcome to</Text>
            <Heading>{import.meta.env.VITE_GOVERNMENT_NAME}</Heading>
            <Text>{t('hero.subtitle')}</Text>
          </div>
        </div>
      </div>
    </div>
  );
}
