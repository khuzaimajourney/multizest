import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ToolLayout from '@/components/tools/ToolLayout';
import ImageResizerTool from '@/components/tools/ImageResizerTool';
import { getToolBySlug } from '@/lib/tools-data';
import { buildToolMetadata } from '@/lib/seo-config';

export const metadata: Metadata = buildToolMetadata('image-resizer');

export default function ImageResizerPage() {
  const tool = getToolBySlug('image-resizer');
  if (!tool) notFound();

  return (
    <ToolLayout tool={tool}>
      <ImageResizerTool />
    </ToolLayout>
  );
}
