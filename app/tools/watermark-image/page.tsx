import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ToolLayout from '@/components/tools/ToolLayout';
import WatermarkTool from '@/components/tools/WatermarkTool';
import { getToolBySlug } from '@/lib/tools-data';

export const metadata: Metadata = {
  title: 'Add Watermark to Image Free Online — Text & Logo | MultiZest',
  description:
    'Protect your photography and brand. Stamp custom text or logo watermarks on photos with live positioning, opacity slider, and zero server uploads.',
  keywords: [
    'add watermark to image',
    'watermark photo online free',
    'stamp logo on image',
    'copyright photo tool',
    'watermark generator online',
  ],
  openGraph: {
    title: 'Add Watermark to Image Online Free — MultiZest',
    description:
      'Easily stamp custom copyright text or logo images onto your photos locally in your browser.',
    url: 'https://multizest.com/tools/watermark-image',
    images: [
      {
        url: 'https://multizest.com/api/og?title=Watermark+Image&category=Image+Tools&desc=Stamp+custom+text+or+logo+watermarks+with+custom+opacity.',
        width: 1200,
        height: 630,
        alt: 'MultiZest Watermark Image Tool',
      },
    ],
  },
  alternates: {
    canonical: 'https://multizest.com/tools/watermark-image',
  },
};

export default function WatermarkPage() {
  const tool = getToolBySlug('watermark-image');
  if (!tool) notFound();

  return (
    <ToolLayout tool={tool}>
      <WatermarkTool />
    </ToolLayout>
  );
}
