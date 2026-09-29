import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ToolLayout from '@/components/tools/ToolLayout';
import TextToSpeechTool from '@/components/tools/TextToSpeechTool';
import { getToolBySlug } from '@/lib/tools-data';
import { buildToolMetadata } from '@/lib/seo-config';

export const metadata: Metadata = buildToolMetadata('text-to-speech');

export default function TextToSpeechPage() {
  const tool = getToolBySlug('text-to-speech');
  if (!tool) notFound();

  return (
    <ToolLayout tool={tool}>
      <TextToSpeechTool />
    </ToolLayout>
  );
}
