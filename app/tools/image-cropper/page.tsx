import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ToolLayout from '@/components/tools/ToolLayout';
import ImageCropperTool from '@/components/tools/ImageCropperTool';
import { getToolBySlug } from '@/lib/tools-data';
import { buildToolMetadata } from '@/lib/seo-config';

export const metadata: Metadata = buildToolMetadata('image-cropper');

export default function ImageCropperPage() {
  const tool = getToolBySlug('image-cropper');
  if (!tool) notFound();

  return (
    <ToolLayout tool={tool}>
      <ImageCropperTool />
    </ToolLayout>
  );
}
