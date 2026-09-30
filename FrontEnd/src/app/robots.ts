import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://altaire.com.br';

  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/login', '/signup'],
      disallow: ['/dashboard/', '/api/'], // Impede o Google de indexar áreas restritas
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}