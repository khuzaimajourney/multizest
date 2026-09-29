import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ToolLayout from '@/components/tools/ToolLayout';
import WordCounterTool from '@/components/tools/WordCounterTool';
import { getToolBySlug } from '@/lib/tools-data';
import { buildToolMetadata } from '@/lib/seo-config';

export const metadata: Metadata = buildToolMetadata('word-counter');

export default function WordCounterPage() {
  const tool = getToolBySlug('word-counter');
  if (!tool) notFound();

  return (
    <ToolLayout tool={tool}>
      <WordCounterTool />
    </ToolLayout>
  );
}
