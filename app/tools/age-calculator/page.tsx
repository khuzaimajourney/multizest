import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ToolLayout from '@/components/tools/ToolLayout';
import AgeCalculatorTool from '@/components/tools/AgeCalculatorTool';
import { getToolBySlug } from '@/lib/tools-data';
import { buildToolMetadata } from '@/lib/seo-config';

export const metadata: Metadata = buildToolMetadata('age-calculator');

export default function AgeCalculatorPage() {
  const tool = getToolBySlug('age-calculator');
  if (!tool) notFound();

  return (
    <ToolLayout tool={tool}>
      <AgeCalculatorTool />
    </ToolLayout>
  );
}
