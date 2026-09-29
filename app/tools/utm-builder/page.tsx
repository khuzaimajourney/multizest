import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ToolLayout from '@/components/tools/ToolLayout';
import UtmBuilderTool from '@/components/tools/UtmBuilderTool';
import { getToolBySlug } from '@/lib/tools-data';
import { buildToolMetadata } from '@/lib/seo-config';

export const metadata: Metadata = buildToolMetadata('utm-builder');

export default function UtmBuilderPage() {
  const tool = getToolBySlug('utm-builder');
  if (!tool) notFound();

  return (
    <ToolLayout tool={tool}>
      <UtmBuilderTool />
    </ToolLayout>
  );
}
