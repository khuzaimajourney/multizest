import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ToolLayout from '@/components/tools/ToolLayout';
import RemoveBgTool from '@/components/tools/RemoveBgTool';
import { getToolBySlug } from '@/lib/tools-data';

export const metadata: Metadata = {
  title: 'Free AI Background Remover Online — 100% Private | MultiZest',
  description:
    'Instantly remove image backgrounds online for free using client-side AI. Zero server uploads, interactive Before/After preview, and instant transparent PNG download.',
  keywords: [
    'free ai background remover online',
    'remove image background free',
    'transparent png cutout',
    'photo background remover private',
    'cutout tool online',
  ],
  openGraph: {
    title: 'Free AI Background Remover Online — MultiZest',
    description:
      'Remove photo backgrounds automatically in your browser with zero server uploads.',
    url: 'https://multizest.com/tools/remove-background',
    images: [
      {
        url: 'https://multizest.com/api/og?title=AI+Background+Remover&category=Image+Tools&desc=Cut+out+photo+backgrounds+instantly+in+your+browser.',
        width: 1200,
        height: 630,
        alt: 'MultiZest AI Image Background Remover',
      },
    ],
  },
  alternates: {
    canonical: 'https://multizest.com/tools/remove-background',
  },
};

export default function RemoveBgPage() {
  const tool = getToolBySlug('remove-background');
  if (!tool) notFound();

  return (
    <ToolLayout tool={tool}>
      <RemoveBgTool />
    </ToolLayout>
  );
}
