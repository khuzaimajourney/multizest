import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ToolLayout from '@/components/tools/ToolLayout';
import ImageConverterTool from '@/components/tools/ImageConverterTool';
import { getToolBySlug } from '@/lib/tools-data';
import { buildToolMetadata } from '@/lib/seo-config';

export const metadata: Metadata = buildToolMetadata('image-converter');

export default function ImageConverterPage() {
  const tool = getToolBySlug('image-converter');
  if (!tool) notFound();

  return (
    <ToolLayout tool={tool}>
      <ImageConverterTool />
    </ToolLayout>
  );
}
