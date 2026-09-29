import { MetadataRoute } from 'next';
import { TOOLS_DATA, TOOL_CATEGORIES } from '@/lib/tools-data';
import { BLOG_POSTS } from '@/lib/blog-data';
import { SITE_CONFIG } from '@/lib/seo-config';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_CONFIG.url;
  const currentDate = new Date().toISOString();

  // 1. Homepage & Main Catalog (Highest priority)
  const homePages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
      images: [
        `${baseUrl}/api/og?title=MultiZest&category=All-in-One+Online+Toolbox&desc=Fast+free+and+private+browser+tools+with+zero+server+uploads.`,
      ],
    },
    {
      url: `${baseUrl}/tools`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.95,
      images: [
        `${baseUrl}/api/og?title=All+31+Online+Tools&category=Tool+Catalog&desc=Explore+31+lightning-fast+privacy-first+browser+utilities.`,
      ],
    },
  ];

  // 2. All 31 Individual Tool Pages — Fully SEO-Optimized
  const toolPages: MetadataRoute.Sitemap = TOOLS_DATA.map((tool) => ({
    url: `${baseUrl}/tools/${tool.slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.9,
    images: [
      `${baseUrl}/api/og?title=${encodeURIComponent(tool.name)}&category=${encodeURIComponent(
        tool.categoryName
      )}&desc=${encodeURIComponent(tool.shortDescription)}`,
    ],
  }));

  // 3. Category Silo Pages (0.8 Priority)
  const categoryPages: MetadataRoute.Sitemap = TOOL_CATEGORIES.map((cat) => ({
    url: `${baseUrl}/categories/${cat.slug}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.8,
    images: [
      `${baseUrl}/api/og?title=${encodeURIComponent(cat.name)}&category=Tool+Category&desc=${encodeURIComponent(
        cat.description
      )}`,
    ],
  }));

  // 4. Educational & Guide Blog Posts (0.75 Priority)
  const blogPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/blog`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.75,
    },
    ...BLOG_POSTS.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt || currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
      images: [
        `${baseUrl}/api/og?title=${encodeURIComponent(post.title)}&category=Blog+Article&desc=${encodeURIComponent(
          post.description
        )}`,
      ],
    })),
  ];

  // 5. Trust, Legal & Support Pages (0.5 Priority)
  const institutionalPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/terms-of-service`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/disclaimer`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/dmca`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ];

  return [
    ...homePages,
    ...toolPages,
    ...categoryPages,
    ...blogPages,
    ...institutionalPages,
  ];
}
