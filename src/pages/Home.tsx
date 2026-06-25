import GovernmentActivitySection from '../components/home/GovernmentActivitySection';
import ServicesSection from '../components/home/ServicesSection';
import SEO from '../components/SEO';
import Hero from '../components/sections/Hero';

const Home: React.FC = () => {
  return (
    <>
      <SEO
        description="Find Bacolod City government services, public data, barangays, permits, hotlines, fuel prices, and local civic information on BetterBacolod."
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
