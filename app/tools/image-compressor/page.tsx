import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ToolLayout from '@/components/tools/ToolLayout';
import ImageCompressorTool from '@/components/tools/ImageCompressorTool';
import { getToolBySlug } from '@/lib/tools-data';
import { buildToolMetadata } from '@/lib/seo-config';

export const metadata: Metadata = buildToolMetadata('image-compressor');

export default function ImageCompressorPage() {
  const tool = getToolBySlug('image-compressor');
  if (!tool) notFound();

  return (
    <ToolLayout tool={tool}>
      <ImageCompressorTool />
    </ToolLayout>
  );
}
