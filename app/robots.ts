import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/admin/',
          '/chat/',
          '/_next/',
          '/uploads/avatar/', // Don't index user avatars
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
