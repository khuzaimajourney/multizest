import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ToolLayout from '@/components/tools/ToolLayout';
import ColorizePhotoTool from '@/components/tools/colorize-photo/ColorizePhotoTool';
import { getToolBySlug } from '@/lib/tools-data';
import { buildToolMetadata } from '@/lib/seo-config';

export const metadata: Metadata = buildToolMetadata('colorize-photo');

export default function ColorizePhotoPage() {
  const tool = getToolBySlug('colorize-photo');
  if (!tool) notFound();

  return (
    <ToolLayout tool={tool}>
      <ColorizePhotoTool />
    </ToolLayout>
  );
}
