import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ToolLayout from '@/components/tools/ToolLayout';
import RotatePdfTool from '@/components/tools/RotatePdfTool';
import { getToolBySlug } from '@/lib/tools-data';
import { buildToolMetadata } from '@/lib/seo-config';

export const metadata: Metadata = buildToolMetadata('rotate-pdf');

export default function RotatePdfPage() {
  const tool = getToolBySlug('rotate-pdf');
  if (!tool) notFound();

  return (
    <ToolLayout tool={tool}>
      <RotatePdfTool />
    </ToolLayout>
  );
}
