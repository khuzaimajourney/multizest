import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ToolLayout from '@/components/tools/ToolLayout';
import VideoTrimmerTool from '@/components/tools/VideoTrimmerTool';
import { getToolBySlug } from '@/lib/tools-data';
import { buildToolMetadata } from '@/lib/seo-config';

export const metadata: Metadata = buildToolMetadata('trimmer');

export default function CategorizedVideoTrimmerPage() {
  const tool = getToolBySlug('trimmer');
  if (!tool) notFound();

  return (
    <ToolLayout tool={tool}>
      <VideoTrimmerTool />
    </ToolLayout>
  );
}
