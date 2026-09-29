import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ToolLayout from '@/components/tools/ToolLayout';
import CompressPdfTool from '@/components/tools/CompressPdfTool';
import { getToolBySlug } from '@/lib/tools-data';
import { buildToolMetadata } from '@/lib/seo-config';

export const metadata: Metadata = buildToolMetadata('compress-pdf');

export default function CompressPdfPage() {
  const tool = getToolBySlug('compress-pdf');
  if (!tool) notFound();

  return (
    <ToolLayout tool={tool}>
      <CompressPdfTool />
    </ToolLayout>
  );
}
