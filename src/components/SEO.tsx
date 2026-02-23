import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  schemaData?: any;
}

export function SEO({
  title = "Design Snapper - The Ultimate AI Design Audit Tool",
  description = "Design Snapper is the premier tool for designers to snap, annotate, and share their work. Get an instant Design Snapper audit with feedback on Accessibility, UX, and more from expert personas.",
  image = "https://www.designsnapper.com/og-image.jpg",
  url = typeof window !== 'undefined' ? window.location.href : "https://www.designsnapper.com",
  schemaData
}: SEOProps) {
  const siteTitle = title === "Design Snapper - AI Design Audit Tool" ? title : `${title} | Design Snapper`;
  const canonicalUrl = url.split('?')[0].split('#')[0]; // Clean URL for canonical

  const defaultSchemaData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Design Snapper",
    "alternateName": "DesignSnapper",
    "url": "https://www.designsnapper.com",
    "logo": "https://www.designsnapper.com/favicon.png",
    "description": description,
    "applicationCategory": "DesignApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0.00",
      "priceCurrency": "USD"
    },
    "author": {
      "@type": "Organization",
      "name": "Design Snapper Team",
      "url": "https://www.designsnapper.com"
    }
  };

  const finalSchema = schemaData || defaultSchemaData;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{siteTitle}</title>
      <meta name="title" content={siteTitle} />
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta charSet="utf-8" />
      <link rel="canonical" href={canonicalUrl} />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(finalSchema)}
      </script>

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={siteTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
    </Helmet>
  );
}
