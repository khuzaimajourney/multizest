import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ToolLayout from '@/components/tools/ToolLayout';
import WatermarkTool from '@/components/tools/WatermarkTool';
import { getToolBySlug } from '@/lib/tools-data';
import { buildToolMetadata } from '@/lib/seo-config';

export const metadata: Metadata = buildToolMetadata('watermark-image');

export default function WatermarkPage() {
  const tool = getToolBySlug('watermark-image');
  if (!tool) notFound();

  return (
    <ToolLayout tool={tool}>
      <WatermarkTool />
    </ToolLayout>
  );
}
