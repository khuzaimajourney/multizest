import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ToolLayout from '@/components/tools/ToolLayout';
import SvgVectorizerTool from '@/components/tools/SvgVectorizerTool';
import { getToolBySlug } from '@/lib/tools-data';
import { buildToolMetadata } from '@/lib/seo-config';

export const metadata: Metadata = buildToolMetadata('svg-vectorizer');

export default function CategorizedSvgVectorizerPage() {
  const tool = getToolBySlug('svg-vectorizer');
  if (!tool) notFound();

  return (
    <ToolLayout tool={tool}>
      <SvgVectorizerTool />
    </ToolLayout>
  );
}
