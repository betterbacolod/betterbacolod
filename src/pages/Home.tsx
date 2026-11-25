import GovernmentActivitySection from '../components/home/GovernmentActivitySection';
import ServicesSection from '../components/home/ServicesSection';
import SEO from '../components/SEO';
import Hero from '../components/sections/Hero';
import { siteMetadata } from '../data/siteMetadata';

const Home: React.FC = () => {
  return (
    <>
      <SEO
        description={siteMetadata.description}
        keywords="Bacolod City services, Bacolod government, Bacolod barangays, Bacolod permits, Bacolod fuel prices, civic tech"
        url="/"
      />
      <main className="flex-grow">
        <Hero />
        <ServicesSection />
        <GovernmentActivitySection />
      </main>
    </>
  );
};

export default Home;
