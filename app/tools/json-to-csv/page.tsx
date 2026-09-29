import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ToolLayout from '@/components/tools/ToolLayout';
import JsonToCsvTool from '@/components/tools/JsonToCsvTool';
import { getToolBySlug } from '@/lib/tools-data';
import { buildToolMetadata } from '@/lib/seo-config';

export const metadata: Metadata = buildToolMetadata('json-to-csv');

export default function JsonToCsvPage() {
  const tool = getToolBySlug('json-to-csv');
  if (!tool) notFound();

  return (
    <ToolLayout tool={tool}>
      <JsonToCsvTool />
    </ToolLayout>
  );
}
