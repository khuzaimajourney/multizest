import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ToolLayout from '@/components/tools/ToolLayout';
import MagicEraserTool from '@/components/tools/magic-eraser/MagicEraserTool';
import { getToolBySlug } from '@/lib/tools-data';
import { buildToolMetadata } from '@/lib/seo-config';

export const metadata: Metadata = buildToolMetadata('magic-eraser');

export default function DirectMagicEraserPage() {
  const tool = getToolBySlug('magic-eraser');
  if (!tool) notFound();

  return (
    <ToolLayout tool={tool}>
      <MagicEraserTool />
    </ToolLayout>
  );
}
