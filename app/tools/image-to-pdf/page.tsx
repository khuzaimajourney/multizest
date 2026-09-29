import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ToolLayout from '@/components/tools/ToolLayout';
import ImageToPdfTool from '@/components/tools/ImageToPdfTool';
import { getToolBySlug } from '@/lib/tools-data';
import { buildToolMetadata } from '@/lib/seo-config';

export const metadata: Metadata = buildToolMetadata('image-to-pdf');

export default function ImageToPdfPage() {
  const tool = getToolBySlug('image-to-pdf');
  if (!tool) notFound();

  return (
    <ToolLayout tool={tool}>
      <ImageToPdfTool />
    </ToolLayout>
  );
}
