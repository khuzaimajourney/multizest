import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ToolLayout from '@/components/tools/ToolLayout';
import JsonFormatterTool from '@/components/tools/JsonFormatterTool';
import { getToolBySlug } from '@/lib/tools-data';
import { buildToolMetadata } from '@/lib/seo-config';

export const metadata: Metadata = buildToolMetadata('json-formatter');

export default function JsonFormatterPage() {
  const tool = getToolBySlug('json-formatter');
  if (!tool) notFound();

  return (
    <ToolLayout tool={tool}>
      <JsonFormatterTool />
    </ToolLayout>
  );
}
