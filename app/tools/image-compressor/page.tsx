import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ToolLayout from '@/components/tools/ToolLayout';
import ImageCompressorTool from '@/components/tools/ImageCompressorTool';
import { getToolBySlug } from '@/lib/tools-data';

export const metadata: Metadata = {
  title: 'Free Online Image Compressor — Reduce Image Size Without Losing Quality',
  description:
    'Compress JPG, PNG, and WebP images to reduce file size up to 80% while maintaining visual quality. Batch processing, client-side privacy, and zero watermarks.',
  openGraph: {
    title: 'Free Online Image Compressor — Reduce Image Size Without Losing Quality',
    description:
      'Compress JPG, PNG, and WebP images to reduce file size up to 80% while maintaining visual quality.',
    url: 'https://multizest.com/tools/image-compressor',
  },
  alternates: {
    canonical: 'https://multizest.com/tools/image-compressor',
  },
};

export default function ImageCompressorPage() {
  const tool = getToolBySlug('image-compressor');
  if (!tool) notFound();

  return (
    <ToolLayout tool={tool}>
      <ImageCompressorTool />
    </ToolLayout>
  );
}
