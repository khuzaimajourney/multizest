import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ToolLayout from '@/components/tools/ToolLayout';
import AiUpscalerTool from '@/components/tools/AiUpscalerTool';
import { getToolBySlug } from '@/lib/tools-data';
import { buildToolMetadata } from '@/lib/seo-config';

export const metadata: Metadata = buildToolMetadata('ai-upscaler');

export default function AiUpscalerPage() {
  const tool = getToolBySlug('ai-upscaler');
  if (!tool) notFound();

  return (
    <ToolLayout tool={tool}>
      <AiUpscalerTool />
    </ToolLayout>
  );
}
