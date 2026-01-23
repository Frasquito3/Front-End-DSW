import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  ogType?: 'website' | 'article' | 'profile';
  ogImage?: string;
  canonical?: string;
  schema?: Record<string, unknown>;
}

export function SEO({
  title,
  description,
  keywords,
  ogType = 'website',
  ogImage = '/img/og-default.png',
  canonical,
  schema
}: SEOProps) {
  const fullTitle = `${title} | Up-Skill`;
  const siteUrl = 'https://up-skill.app';
  const canonicalUrl = canonical ? (canonical.startsWith('http') ? canonical : `${siteUrl}${canonical}`) : typeof window !== 'undefined' ? window.location.href : siteUrl;
  const imageUrl = ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={canonicalUrl} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#3b82f6" />

      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content="UpSkill" />
      <meta property="og:locale" content="es_AR" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />

      <meta name="robots" content="index, follow, max-image-preview:large" />
      <meta name="language" content="Spanish" />
      <meta name="author" content="UpSkill Team" />
      <meta httpEquiv="Content-Language" content="es" />

      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
}