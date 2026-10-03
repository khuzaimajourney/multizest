import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ToolLayout from '@/components/tools/ToolLayout';
import NoiseRemoverTool from '@/components/tools/noise-remover/NoiseRemoverTool';
import { getToolBySlug } from '@/lib/tools-data';
import { buildToolMetadata } from '@/lib/seo-config';

export const metadata: Metadata = buildToolMetadata('noise-remover');

export default function DirectNoiseRemoverPage() {
  const tool = getToolBySlug('noise-remover');
  if (!tool) notFound();

  return (
    <ToolLayout tool={tool}>
      <NoiseRemoverTool />
    </ToolLayout>
  );
}
