import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ToolLayout from '@/components/tools/ToolLayout';
import ImageConverterTool from '@/components/tools/ImageConverterTool';
import { getToolBySlug } from '@/lib/tools-data';

export const metadata: Metadata = {
  title: 'Free Image Format Converter — Convert JPG, PNG, WebP Online | MultiZest',
  description:
    'Convert images instantly between JPG, PNG, WebP, BMP, and GIF formats. Batch conversion, transparency preservation, and zero file uploads.',
  openGraph: {
    title: 'Free Image Format Converter — Convert JPG, PNG, WebP Online | MultiZest',
    description:
      'Batch convert images between JPG, PNG, WebP, BMP, and GIF formats with full quality control.',
    url: 'https://multizest.com/tools/image-converter',
  },
  alternates: {
    canonical: 'https://multizest.com/tools/image-converter',
  },
};

export default function ImageConverterPage() {
  const tool = getToolBySlug('image-converter');
  if (!tool) notFound();

  return (
    <ToolLayout tool={tool}>
      <ImageConverterTool />
    </ToolLayout>
  );
}
