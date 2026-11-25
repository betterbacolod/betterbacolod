import { Helmet } from 'react-helmet-async';
import { siteStructuredData } from '../data/siteMetadata';

export default function StructuredData() {
  return (
    <Helmet>
      {siteStructuredData.map((data) => (
        <script key={data['@type']} type="application/ld+json">
          {JSON.stringify(data)}
        </script>
      ))}
    </Helmet>
  );
}
