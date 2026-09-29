import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ToolLayout from '@/components/tools/ToolLayout';
import PdfToImageTool from '@/components/tools/PdfToImageTool';
import { getToolBySlug } from '@/lib/tools-data';
import { buildToolMetadata } from '@/lib/seo-config';

export const metadata: Metadata = buildToolMetadata('pdf-to-image');

export default function PdfToImagePage() {
  const tool = getToolBySlug('pdf-to-image');
  if (!tool) notFound();

  return (
    <ToolLayout tool={tool}>
      <PdfToImageTool />
    </ToolLayout>
  );
}
