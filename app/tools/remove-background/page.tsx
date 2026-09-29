import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ToolLayout from '@/components/tools/ToolLayout';
import RemoveBgTool from '@/components/tools/RemoveBgTool';
import { getToolBySlug } from '@/lib/tools-data';
import { buildToolMetadata } from '@/lib/seo-config';

export const metadata: Metadata = buildToolMetadata('remove-background');

export default function RemoveBgPage() {
  const tool = getToolBySlug('remove-background');
  if (!tool) notFound();

  return (
    <ToolLayout tool={tool}>
      <RemoveBgTool />
    </ToolLayout>
  );
}
