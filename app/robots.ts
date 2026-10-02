import { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/lib/seo-config';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = SITE_CONFIG.url;

  return {
    rules: [
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/private/'],
      },
      {
        userAgent: 'Googlebot-Image',
        allow: ['/api/og', '/images/', '/*.svg$', '/*.png$', '/*.ico$', '/*.jpg$', '/*.webp$'],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/api/private/'],
      },
      {
        userAgent: 'DuckDuckBot',
        allow: '/',
      },
      {
        userAgent: 'YandexBot',
        allow: '/',
      },
      {
        userAgent: 'Applebot',
        allow: '/',
      },
      {
        userAgent: 'Twitterbot',
        allow: '/',
      },
      {
        userAgent: 'facebookexternalhit',
        allow: '/',
      },
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/private/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl.replace(/^https?:\/\//, ''),
  };
}
