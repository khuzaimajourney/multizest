import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ToolLayout from '@/components/tools/ToolLayout';
import ColorPickerTool from '@/components/tools/ColorPickerTool';
import { getToolBySlug } from '@/lib/tools-data';
import { buildToolMetadata } from '@/lib/seo-config';

export const metadata: Metadata = buildToolMetadata('color-picker');

export default function ColorPickerPage() {
  const tool = getToolBySlug('color-picker');
  if (!tool) notFound();

  return (
    <ToolLayout tool={tool}>
      <ColorPickerTool />
    </ToolLayout>
  );
}
