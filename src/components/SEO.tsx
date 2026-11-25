import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { siteMetadata } from '../data/siteMetadata';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  imageAlt?: string;
  imageWidth?: number;
  imageHeight?: number;
  structuredData?: Record<string, unknown>[];
  url?: string;
  type?: string;
}

export default function SEO({
  title,
  description,
  keywords,
  image,
  imageAlt = siteMetadata.imageAlt,
  imageWidth = 1080,
  imageHeight = 1080,
  structuredData = [],
  url,
  type = 'website',
}: SEOProps) {
  const location = useLocation();
  const siteName = siteMetadata.name;
  const siteUrl = siteMetadata.url;
  const defaultTitle = siteMetadata.title;
  const defaultDescription = siteMetadata.description;
  const defaultKeywords =
    'bacolod city, bacolod services, bacolod government, bacolod barangays, bacolod fuel prices, negros occidental, civic tech';

  const fullTitle = title ? `${title} | ${siteName}` : defaultTitle;
  const fullDescription = description || defaultDescription;
  const canonicalPath = url || location.pathname;
  const fullUrl = canonicalPath.startsWith('http')
    ? canonicalPath
    : `${siteUrl}${canonicalPath}`;
  const fullImage = image || siteMetadata.image;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      <meta name="keywords" content={keywords || defaultKeywords} />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:image:alt" content={imageAlt} />
      <meta property="og:image:width" content={String(imageWidth)} />
      <meta property="og:image:height" content={String(imageHeight)} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={fullImage} />
      <meta name="twitter:image:alt" content={imageAlt} />
      {structuredData.map((data) => (
        <script key={String(data['@type'])} type="application/ld+json">
          {JSON.stringify(data).replace(/</g, '\\u003c')}
        </script>
      ))}
    </Helmet>
  );
}
