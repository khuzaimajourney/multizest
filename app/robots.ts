import { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/lib/seo-config';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = SITE_CONFIG.url;

  return {
    rules: [
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/tools/',
          '/categories/',
          '/blog/',
          '/api/og',
          '/_next/static/',
          '/favicon.svg',
          '/favicon.ico',
          '/apple-touch-icon.png',
        ],
        disallow: ['/api/private/'],
      },
      {
        userAgent: 'Googlebot-Image',
        allow: ['/api/og', '/images/', '/*.svg$', '/*.png$', '/*.ico$', '/*.jpg$'],
      },
      {
        userAgent: 'Bingbot',
        allow: ['/', '/tools/', '/categories/', '/blog/', '/api/og'],
        disallow: ['/api/private/'],
      },
      {
        userAgent: 'Twitterbot',
        allow: ['/', '/api/og'],
      },
      {
        userAgent: 'facebookexternalhit',
        allow: ['/', '/api/og'],
      },
      {
        userAgent: '*',
        allow: ['/', '/tools/', '/categories/', '/blog/', '/api/og'],
        disallow: ['/api/private/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl.replace(/^https?:\/\//, ''),
  };
}
