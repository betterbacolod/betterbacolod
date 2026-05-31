import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useParams } from 'react-router-dom';
import remarkGfm from 'remark-gfm';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Heading } from '../components/ui/Heading';
import Section from '../components/ui/Section';
import { Text } from '../components/ui/Text';
import { createMarkdownComponents } from '../lib/markdownComponents';
import {
  loadMarkdownContent,
  type MarkdownContent,
} from '../lib/markdownLoader';
import { getTypographyTheme } from '../lib/typographyThemes';

interface DocumentProps {
  theme?: string; // Typography theme name
}

const defaultBreadcrumbs = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
];

export default function Document({
  theme: initialTheme = 'default',
}: DocumentProps) {
  const { documentSlug } = useParams();
  const [markdownContent, setMarkdownContent] =
    useState<MarkdownContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const markdownComponents = createMarkdownComponents(
    getTypographyTheme(initialTheme),
  );

  const breadcrumbs =
    markdownContent?.category && markdownContent.subcategory
      ? [
          ...defaultBreadcrumbs,
          {
            label: markdownContent.category.category,
            href: `/services/${markdownContent.category.slug}`,
          },
          {
            label: markdownContent.subcategory.name,
            href: `/${markdownContent.subcategory.slug}`,
          },
        ]
      : defaultBreadcrumbs;

  useEffect(() => {
    if (!documentSlug) {
      setError('No document specified');
      setLoading(false);
      return;
    }

    const loadContent = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load content
        const content = await loadMarkdownContent(documentSlug);
        setMarkdownContent(content);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load document',
        );
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [documentSlug]);

  if (loading) {
    return <div className="min-h-screen bg-white" />;
  }

  if (error) {
    return (
      <Section className="p-3 mb-12">
        <Breadcrumbs className="mb-8" items={breadcrumbs} />
        <Heading>Document Not Found</Heading>
        <Text className="text-red-600 mb-6">{error}</Text>
      </Section>
    );
  }

  if (!markdownContent) {
    return null;
  }

  return (
    <>
      <SEO
        title={markdownContent.title || documentSlug}
        description={
          markdownContent.description ||
          `Government service information for ${documentSlug}`
        }
        keywords={`${documentSlug}, government services, public services, local government`}
      />
      <Section className="p-3 mb-12">
        <Breadcrumbs className="mb-8" items={breadcrumbs} />
        <Card className="mb-8 markdown-content">
          <CardHeader>
            {markdownContent.description && (
              <CardContent>{markdownContent.description}</CardContent>
            )}
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={markdownComponents}
            >
              {markdownContent.content}
            </ReactMarkdown>
          </CardHeader>
        </Card>
      </Section>
    </>
  );
}
