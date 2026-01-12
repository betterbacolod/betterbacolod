import GovernmentActivitySection from '../components/home/GovernmentActivitySection';
import ServicesSection from '../components/home/ServicesSection';
import SEO from '../components/SEO';
import Hero from '../components/sections/Hero';

const Home: React.FC = () => {
  return (
    <>
      <SEO
        title="Home"
        description="Community portal for Bacolod City government services, officials, departments, barangays, and transparency data. Find permits, hotlines, and more."
        keywords="Bacolod City, government services, barangay, city hall, permits, civic tech"
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
