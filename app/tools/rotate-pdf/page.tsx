import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ToolLayout from '@/components/tools/ToolLayout';
import RotatePdfTool from '@/components/tools/RotatePdfTool';
import { getToolBySlug } from '@/lib/tools-data';

export const metadata: Metadata = {
  title: 'Rotate PDF Online Free — Permanently Rotate PDF Pages | MultiZest',
  description:
    'Rotate PDF pages 90, 180, or 270 degrees online permanently. Fix upside-down scans and misaligned pages for free with zero server uploads.',
  keywords: [
    'rotate pdf online free',
    'rotate pdf pages permanently',
    'fix upside down pdf',
    'turn pdf sideways',
    'rotate scanned document',
  ],
  openGraph: {
    title: 'Rotate PDF Pages Online Free — MultiZest',
    description:
      'Permanently rotate misaligned or upside-down PDF documents right in your browser.',
    url: 'https://multizest.com/tools/rotate-pdf',
    images: [
      {
        url: 'https://multizest.com/api/og?title=Rotate+PDF+Pages&category=PDF+Tools&desc=Permanently+rotate+individual+pages+or+entire+PDF+documents.',
        width: 1200,
        height: 630,
        alt: 'MultiZest Rotate PDF Tool',
      },
    ],
  },
  alternates: {
    canonical: 'https://multizest.com/tools/rotate-pdf',
  },
};

export default function RotatePdfPage() {
  const tool = getToolBySlug('rotate-pdf');
  if (!tool) notFound();

  return (
    <ToolLayout tool={tool}>
      <RotatePdfTool />
    </ToolLayout>
  );
}
