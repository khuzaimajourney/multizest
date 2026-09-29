import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ToolLayout from '@/components/tools/ToolLayout';
import VideoToAudioTool from '@/components/tools/VideoToAudioTool';
import { getToolBySlug } from '@/lib/tools-data';
import { buildToolMetadata } from '@/lib/seo-config';

export const metadata: Metadata = buildToolMetadata('video-to-audio');

export default function VideoToAudioPage() {
  const tool = getToolBySlug('video-to-audio');
  if (!tool) notFound();

  return (
    <ToolLayout tool={tool}>
      <VideoToAudioTool />
    </ToolLayout>
  );
}
