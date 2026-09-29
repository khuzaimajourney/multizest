import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ToolLayout from '@/components/tools/ToolLayout';
import SplitPdfTool from '@/components/tools/SplitPdfTool';
import { getToolBySlug } from '@/lib/tools-data';
import { buildToolMetadata } from '@/lib/seo-config';

export const metadata: Metadata = buildToolMetadata('split-pdf');

export default function SplitPdfPage() {
  const tool = getToolBySlug('split-pdf');
  if (!tool) notFound();

  return (
    <ToolLayout tool={tool}>
      <SplitPdfTool />
    </ToolLayout>
  );
}
