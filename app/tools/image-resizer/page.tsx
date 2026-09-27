import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ToolLayout from '@/components/tools/ToolLayout';
import ImageResizerTool from '@/components/tools/ImageResizerTool';
import { getToolBySlug } from '@/lib/tools-data';

export const metadata: Metadata = {
  title: 'Free Online Image Resizer — Resize Images to Any Dimension',
  description:
    'Resize your images to exact pixel dimensions, percentage ratios, or social media presets with aspect ratio locking. 100% free and in-browser.',
  openGraph: {
    title: 'Free Online Image Resizer — Resize Images to Any Dimension',
    description:
      'Resize your images to exact pixel dimensions, percentage ratios, or social media presets with aspect ratio locking.',
    url: 'https://multizest.com/tools/image-resizer',
  },
  alternates: {
    canonical: 'https://multizest.com/tools/image-resizer',
  },
};

export default function ImageResizerPage() {
  const tool = getToolBySlug('image-resizer');
  if (!tool) notFound();

  return (
    <ToolLayout tool={tool}>
      <ImageResizerTool />
    </ToolLayout>
  );
}
