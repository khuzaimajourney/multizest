import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ToolLayout from '@/components/tools/ToolLayout';
import UtmBuilderTool from '@/components/tools/UtmBuilderTool';
import { getToolBySlug } from '@/lib/tools-data';

export const metadata: Metadata = {
  title: 'UTM Campaign Link Builder Free Online — GA4 Compatible | MultiZest',
  description:
    'Build clean, trackable Google Analytics (GA4) campaign URLs with source, medium, and term parameters. Includes instant copy and one-click presets.',
  keywords: [
    'utm link builder',
    'utm campaign generator',
    'google analytics tracking url',
    'ga4 campaign url builder',
    'marketing tracking links',
  ],
  openGraph: {
    title: 'UTM Campaign Link Builder Online Free — MultiZest',
    description:
      'Build clean, standardized GA4 tracking URLs with source, medium, and campaign parameters.',
    url: 'https://multizest.com/tools/utm-builder',
    images: [
      {
        url: 'https://multizest.com/api/og?title=UTM+Link+Builder&category=Web+Tools&desc=Build+standardized+tracking+URLs+for+Google+Analytics+4.',
        width: 1200,
        height: 630,
        alt: 'MultiZest UTM Link Builder Tool',
      },
    ],
  },
  alternates: {
    canonical: 'https://multizest.com/tools/utm-builder',
  },
};

export default function UtmBuilderPage() {
  const tool = getToolBySlug('utm-builder');
  if (!tool) notFound();

  return (
    <ToolLayout tool={tool}>
      <UtmBuilderTool />
    </ToolLayout>
  );
}
