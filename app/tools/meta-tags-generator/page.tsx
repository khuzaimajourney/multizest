import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ToolLayout from '@/components/tools/ToolLayout';
import MetaTagsTool from '@/components/tools/MetaTagsTool';
import { getToolBySlug } from '@/lib/tools-data';
import { buildToolMetadata } from '@/lib/seo-config';

export const metadata: Metadata = buildToolMetadata('meta-tags-generator');

export default function MetaTagsPage() {
  const tool = getToolBySlug('meta-tags-generator');
  if (!tool) notFound();

  return (
    <ToolLayout tool={tool}>
      <MetaTagsTool />
    </ToolLayout>
  );
}
