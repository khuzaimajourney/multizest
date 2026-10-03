import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ToolLayout from '@/components/tools/ToolLayout';
import AiSummarizerTool from '@/components/tools/AiSummarizerTool';
import { getToolBySlug } from '@/lib/tools-data';
import { buildToolMetadata } from '@/lib/seo-config';

export const metadata: Metadata = buildToolMetadata('ai-summarizer');

export default function AiSummarizerPage() {
  const tool = getToolBySlug('ai-summarizer');
  if (!tool) notFound();

  return (
    <ToolLayout tool={tool}>
      <AiSummarizerTool />
    </ToolLayout>
  );
}
