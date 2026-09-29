import type { Metadata } from 'next';
import { ToolItem, ToolFAQ, BlogPost } from './types';
import { getToolBySlug } from './tools-data';

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://multizest.vercel.app';

export const SITE_CONFIG = {
  name: 'MultiZest',
  tagline: 'Your All-in-One Online Toolbox — Fast, Free & Easy',
  description: 'MultiZest is your all-in-one free online toolbox. Fast, private, browser-based tools to compress images, convert PDFs, generate QR codes, count words, and resize images.',
  url: SITE_URL,
  keywords: [
    'free online tools',
    'PDF to image',
    'image compressor',
    'image resizer',
    'word counter',
    'QR code generator',
    'browser tools',
    'client-side privacy',
    'MultiZest',
  ],
  author: 'MultiZest Team',
  twitterHandle: '@multizest',
  contactEmail: 'khuzaimajourney@gmail.com',
};

export function buildToolMetadata(slug: string): Metadata {
  const tool = getToolBySlug(slug);
  if (!tool) {
    return {
      title: 'Free Online Tool | MultiZest',
      description: 'Free, fast, and secure browser-based tool with zero server uploads.',
    };
  }

  const ogImageUrl = `/api/og?title=${encodeURIComponent(tool.name)}&category=${encodeURIComponent(tool.categoryName)}&desc=${encodeURIComponent(tool.shortDescription)}`;

  return {
    title: `${tool.name} — Free Online Tool | MultiZest`,
    description: tool.shortDescription,
    keywords: [
      tool.name.toLowerCase(),
      `${tool.name.toLowerCase()} online free`,
      `${tool.name.toLowerCase()} converter`,
      tool.categoryName.toLowerCase(),
      'free browser tool',
      'client side privacy',
      'no file upload',
      'multizest',
    ],
    alternates: {
      canonical: `/tools/${tool.slug}`,
    },
    openGraph: {
      title: `${tool.name} — Free Online Tool | MultiZest`,
      description: tool.shortDescription,
      url: `/tools/${tool.slug}`,
      siteName: SITE_CONFIG.name,
      locale: 'en_US',
      type: 'website',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${tool.name} — MultiZest`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${tool.name} — Free Online Tool | MultiZest`,
      description: tool.shortDescription,
      creator: SITE_CONFIG.twitterHandle,
      images: [ogImageUrl],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_CONFIG.name,
    headline: SITE_CONFIG.tagline,
    url: SITE_CONFIG.url,
    description: SITE_CONFIG.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_CONFIG.url}/tools?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    logo: `${SITE_CONFIG.url}/images/logo.svg`,
    description: SITE_CONFIG.description,
    email: SITE_CONFIG.contactEmail,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: SITE_CONFIG.contactEmail,
      availableLanguage: ['English'],
    },
    sameAs: [],
  };
}

export function generateWebApplicationSchema(tool: ToolItem) {
  const ratingValue = (tool.rating || 4.9).toFixed(1);
  const ratingCount = tool.ratingCount || 1240;

  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: `${tool.name} — MultiZest`,
    applicationCategory: 'BrowserApplication',
    operatingSystem: 'All',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    description: tool.shortDescription,
    url: `${SITE_CONFIG.url}/tools/${tool.slug}`,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: ratingValue,
      reviewCount: ratingCount,
      bestRating: '5',
      worstRating: '1',
    },
    featureList: tool.features.join(', '),
  };
}

export function generateAggregateRatingSchema(tool: ToolItem) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.name,
    operatingSystem: 'All',
    applicationCategory: 'BrowserApplication',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: (tool.rating || 4.9).toFixed(1),
      ratingCount: tool.ratingCount || 1240,
      bestRating: '5',
      worstRating: '1',
    },
  };
}

export function generateToolBreadcrumbSchema(tool: ToolItem) {
  return generateBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: tool.categoryName, item: `/categories/${tool.category}` },
    { name: tool.name, item: `/tools/${tool.slug}` },
  ]);
}

export function generateFAQSchema(faqs: ToolFAQ[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function generateHowToSchema(tool: ToolItem) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `How to Use the ${tool.name}`,
    description: tool.longDescription,
    step: tool.howToSteps.map((step, idx) => ({
      '@type': 'HowToStep',
      position: idx + 1,
      name: step.title,
      text: step.description,
    })),
  };
}

export function generateBreadcrumbSchema(items: { name: string; item: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((crumb, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: crumb.name,
      item: crumb.item.startsWith('http') ? crumb.item : `${SITE_CONFIG.url}${crumb.item}`,
    })),
  };
}

export function generateArticleSchema(post: BlogPost) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      '@type': 'Organization',
      name: post.author.name,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_CONFIG.url}/blog/${post.slug}`,
    },
  };
}
