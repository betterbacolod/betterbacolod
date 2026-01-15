import { Helmet } from 'react-helmet-async';

const siteUrl = 'https://betterbacolod.org';

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'BetterBacolod',
  url: siteUrl,
  description:
    'Community portal for Bacolod City government services, officials, and transparency data',
  potentialAction: {
    '@type': 'SearchAction',
    target: `${siteUrl}/search?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'BetterBacolod',
  url: siteUrl,
  logo: `${siteUrl}/images/icons/B-Logo/BetterBacolod Icons_favicon tp.png`,
  description: 'Community portal for Bacolod City government services',
  areaServed: {
    '@type': 'City',
    name: 'Bacolod City',
    containedInPlace: {
      '@type': 'AdministrativeArea',
      name: 'Negros Occidental, Philippines',
    },
  },
  sameAs: ['https://facebook.com/betterbacolod.org'],
};

export default function StructuredData() {
  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(websiteSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>
    </Helmet>
  );
}
