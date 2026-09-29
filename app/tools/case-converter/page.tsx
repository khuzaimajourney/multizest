import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ToolLayout from '@/components/tools/ToolLayout';
import CaseConverterTool from '@/components/tools/CaseConverterTool';
import { getToolBySlug } from '@/lib/tools-data';
import { buildToolMetadata } from '@/lib/seo-config';

export const metadata: Metadata = buildToolMetadata('case-converter');

export default function CaseConverterPage() {
  const tool = getToolBySlug('case-converter');
  if (!tool) notFound();

  return (
    <ToolLayout tool={tool}>
      <CaseConverterTool />
    </ToolLayout>
  );
}
