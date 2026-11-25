export const siteMetadata = {
  name: 'BetterBacolod',
  url: 'https://betterbacolod.org',
  title: 'BetterBacolod | Bacolod City Services, Government Info & Public Data',
  description:
    'Find Bacolod City government services, public data, barangays, permits, hotlines, fuel prices, and local civic information on BetterBacolod.',
  image: 'https://betterbacolod.org/images/icons/1080x1080/og-image.png',
  imageAlt: 'BetterBacolod civic information portal',
};

export const siteStructuredData = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteMetadata.url}/#website`,
    name: siteMetadata.name,
    alternateName: 'Better Bacolod',
    url: siteMetadata.url,
    description: siteMetadata.description,
    inLanguage: 'en-PH',
    publisher: { '@id': `${siteMetadata.url}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteMetadata.url}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${siteMetadata.url}/#organization`,
    name: siteMetadata.name,
    url: siteMetadata.url,
    logo: `${siteMetadata.url}/images/logos/nav-logo.png`,
    description:
      'Independent civic information project for Bacolod City government services, public guides, and transparency data. Not an official government website.',
    areaServed: { '@type': 'City', name: 'Bacolod City, Philippines' },
    sameAs: ['https://facebook.com/betterbacolod.org'],
  },
];

export function pageStructuredData(
  path: string,
  name: string,
  description: string,
) {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      '@id': `${siteMetadata.url}${path}#page`,
      name,
      description,
      url: `${siteMetadata.url}${path}`,
      inLanguage: 'en-PH',
      isPartOf: { '@id': `${siteMetadata.url}/#website` },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: siteMetadata.url,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name,
          item: `${siteMetadata.url}${path}`,
        },
      ],
    },
  ];
}
