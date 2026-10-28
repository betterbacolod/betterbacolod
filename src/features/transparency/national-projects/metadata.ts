const siteUrl = 'https://betterbacolod.org';

export const nationalProjectsMetadata = {
  title: '2027 NIR Budget Leaderboard & Bacolod Projects',
  description:
    'Find your NIR district and representative. Compare proposed 2027 DPWH funding and explore projects in Bacolod, Negros Occidental, Negros Oriental, and Siquijor.',
  keywords:
    'Bacolod budget 2027, NIR budget leaderboard, Negros Island Region, DPWH projects, Bacolod congressman, Negros Occidental, Negros Oriental, Siquijor, NEP House budget comparison',
  url: '/transparency/national-projects',
  image: `${siteUrl}/images/icons/1080x1080/og-image.png`,
  imageAlt: 'BetterBacolod civic information portal',
  imageWidth: 1080,
  imageHeight: 1080,
};

export const nationalProjectsStructuredData = [
  {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: nationalProjectsMetadata.title,
    description: nationalProjectsMetadata.description,
    url: `${siteUrl}${nationalProjectsMetadata.url}`,
    image: nationalProjectsMetadata.image,
    inLanguage: 'en-PH',
    isPartOf: { '@type': 'WebSite', name: 'BetterBacolod', url: siteUrl },
    about: [
      { '@type': 'Thing', name: 'FY2027 proposed DPWH infrastructure funding' },
      {
        '@type': 'AdministrativeArea',
        name: 'Negros Island Region, Philippines',
      },
    ],
    citation: 'https://budget.bettergov.ph/hgab/2027/sources',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Transparency',
        item: `${siteUrl}/transparency`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: '2027 National Projects',
        item: `${siteUrl}${nationalProjectsMetadata.url}`,
      },
    ],
  },
];
