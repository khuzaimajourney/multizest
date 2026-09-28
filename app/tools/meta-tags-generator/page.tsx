import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ToolLayout from '@/components/tools/ToolLayout';
import MetaTagsTool from '@/components/tools/MetaTagsTool';
import { getToolBySlug } from '@/lib/tools-data';

export const metadata: Metadata = {
  title: 'Meta Tags & OpenGraph Generator Free Online | MultiZest',
  description:
    'Generate Google SEO meta tags, Facebook OpenGraph, and Twitter Cards with real-time interactive search and social media previews. 100% free and instant.',
  keywords: [
    'meta tags generator',
    'opengraph generator',
    'twitter card generator',
    'seo meta tags builder',
    'social share preview tool',
  ],
  openGraph: {
    title: 'Meta Tags & OpenGraph Generator Free Online — MultiZest',
    description:
      'Craft perfectly formatted HTML meta tags and preview your social cards on Google, Twitter, and Facebook.',
    url: 'https://multizest.com/tools/meta-tags-generator',
    images: [
      {
        url: 'https://multizest.com/api/og?title=Meta+Tags+Generator&category=Web+Tools&desc=Generate+Google+and+Social+OpenGraph+tags+with+live+previews.',
        width: 1200,
        height: 630,
        alt: 'MultiZest Meta Tags Generator',
      },
    ],
  },
  alternates: {
    canonical: 'https://multizest.com/tools/meta-tags-generator',
  },
};

export default function MetaTagsPage() {
  const tool = getToolBySlug('meta-tags-generator');
  if (!tool) notFound();

  return (
    <ToolLayout tool={tool}>
      <MetaTagsTool />
    </ToolLayout>
  );
}
