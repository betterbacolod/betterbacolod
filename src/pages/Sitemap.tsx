import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { Heading } from '../components/ui/Heading';
import Section from '../components/ui/Section';
import { seoGuides } from '../data/seoGuides';
import { serviceCategories } from '../data/yamlLoader';

interface Category {
  category: string;
  slug: string;
}

const Sitemap: React.FC = () => {
  const sections = [
    {
      title: 'Main Pages',
      links: [
        { label: 'Home', href: '/' },
        { label: 'Services', href: '/services' },
        { label: 'Government', href: '/government' },
        { label: 'Transparency', href: '/transparency' },
        { label: 'About', href: '/about' },
      ],
    },
    {
      title: 'Services',
      links: (serviceCategories.categories as Category[]).map((cat) => ({
        label: cat.category,
        href: `/services/${cat.slug}`,
      })),
    },
    {
      title: 'Bacolod Guides',
      links: seoGuides.map((guide) => ({
        label: guide.title,
        href: guide.path,
      })),
    },
  ];

  return (
    <>
      <SEO
        title="Sitemap"
        description="Complete sitemap of BetterBacolod pages, Bacolod City service categories, and local guides."
        keywords="BetterBacolod sitemap, Bacolod services, Bacolod guides"
        url="/sitemap"
      />
      <Section className="min-h-[60vh]">
        <div className="max-w-4xl mx-auto">
          <Heading level={2} className="mb-8">
            Sitemap
          </Heading>
          <div className="grid md:grid-cols-2 gap-8">
            {sections.map((section) => (
              <div
                key={section.title}
                className="bg-white border rounded-lg p-6"
              >
                <h3 className="font-semibold text-gray-900 mb-4">
                  {section.title}
                </h3>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        to={link.href}
                        className="text-sm text-primary-600 hover:underline"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </>
  );
};

export default Sitemap;
