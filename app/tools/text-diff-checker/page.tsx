import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ToolLayout from '@/components/tools/ToolLayout';
import TextDiffTool from '@/components/tools/TextDiffTool';
import { getToolBySlug } from '@/lib/tools-data';
import { buildToolMetadata } from '@/lib/seo-config';

export const metadata: Metadata = buildToolMetadata('text-diff-checker');

export default function TextDiffPage() {
  const tool = getToolBySlug('text-diff-checker');
  if (!tool) notFound();

  return (
    <ToolLayout tool={tool}>
      <TextDiffTool />
    </ToolLayout>
  );
}
