import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

export default function SEO({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
}: SEOProps) {
  const siteName = 'BetterBacolod';
  const siteUrl = 'https://betterbacolod.org';
  const defaultTitle = 'BetterBacolod | Bacolod City Government Services';
  const defaultDescription =
    'Community portal for Bacolod City government services, officials, departments, barangays, and transparency data.';
  const defaultKeywords =
    'bacolod city, government services, city of smiles, negros occidental, masskara, civic tech';

  const fullTitle = title ? `${title} | ${siteName}` : defaultTitle;
  const fullDescription = description || defaultDescription;
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
  const fullImage = image || `${siteUrl}/images/icons/1080x1080/og-image.png`;

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
      <meta property="og:site_name" content={siteName} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={fullImage} />
    </Helmet>
  );
}
