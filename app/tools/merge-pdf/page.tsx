import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ToolLayout from '@/components/tools/ToolLayout';
import MergePdfTool from '@/components/tools/MergePdfTool';
import { getToolBySlug } from '@/lib/tools-data';
import { buildToolMetadata } from '@/lib/seo-config';

export const metadata: Metadata = buildToolMetadata('merge-pdf');

export default function MergePdfPage() {
  const tool = getToolBySlug('merge-pdf');
  if (!tool) notFound();

  return (
    <ToolLayout tool={tool}>
      <MergePdfTool />
    </ToolLayout>
  );
}
