import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ToolLayout from '@/components/tools/ToolLayout';
import MarkdownPreviewTool from '@/components/tools/MarkdownPreviewTool';
import { getToolBySlug } from '@/lib/tools-data';
import { buildToolMetadata } from '@/lib/seo-config';

export const metadata: Metadata = buildToolMetadata('markdown-preview');

export default function MarkdownPage() {
  const tool = getToolBySlug('markdown-preview');
  if (!tool) notFound();

  return (
    <ToolLayout tool={tool}>
      <MarkdownPreviewTool />
    </ToolLayout>
  );
}
