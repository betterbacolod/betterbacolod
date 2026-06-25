import { ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { Card, CardContent } from '../components/ui/Card';
import { Heading } from '../components/ui/Heading';
import Section from '../components/ui/Section';
import { Text } from '../components/ui/Text';
import type { SeoGuide } from '../data/seoGuides';

function GuideLink({
  href,
  label,
  className = '',
}: {
  href: string;
  label: string;
  className?: string;
}) {
  if (href.startsWith('http')) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {label}
        <ExternalLink className="inline h-3 w-3 ml-1" aria-hidden="true" />
      </a>
    );
  }

  return (
    <Link to={href} className={className}>
      {label}
    </Link>
  );
}

export default function SeoLandingPage({ guide }: { guide: SeoGuide }) {
  return (
    <>
      <SEO
        title={guide.title}
        description={guide.description}
        keywords={guide.keywords}
        url={guide.path}
      />
      <Section className="min-h-[60vh]">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.12em] text-primary-600 font-semibold mb-2">
              Bacolod guide
            </p>
            <Heading>{guide.heading}</Heading>
            <Text className="text-gray-600 max-w-3xl mt-3">{guide.intro}</Text>
          </div>

          <div className="grid gap-4 md:grid-cols-3 mb-8">
            {guide.primaryLinks.map((link) => (
              <Card key={link.href} hoverable className="h-full">
                <CardContent className="h-full flex flex-col">
                  <h2 className="font-semibold text-gray-900 mb-2 text-base">
                    <GuideLink
                      href={link.href}
                      label={link.label}
                      className="hover:text-primary-700"
                    />
                  </h2>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {link.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardContent>
              <h2 className="font-semibold text-gray-900 mb-3">
                Related Bacolod resources
              </h2>
              <div className="flex flex-wrap gap-2">
                {guide.relatedLinks.map((link) => (
                  <GuideLink
                    key={`${link.href}-${link.label}`}
                    href={link.href}
                    label={link.label}
                    className="inline-flex items-center px-3 py-1.5 rounded-full bg-primary-50 text-primary-700 text-sm hover:bg-primary-100 transition-colors"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </Section>
    </>
  );
}
