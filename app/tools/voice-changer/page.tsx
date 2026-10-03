import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ToolLayout from '@/components/tools/ToolLayout';
import VoiceChangerTool from '@/components/tools/voice-changer/VoiceChangerTool';
import { getToolBySlug } from '@/lib/tools-data';
import { buildToolMetadata } from '@/lib/seo-config';

export const metadata: Metadata = buildToolMetadata('voice-changer');

export default function DirectVoiceChangerPage() {
  const tool = getToolBySlug('voice-changer');
  if (!tool) notFound();

  return (
    <ToolLayout tool={tool}>
      <VoiceChangerTool />
    </ToolLayout>
  );
}
