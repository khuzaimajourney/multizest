import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ToolLayout from '@/components/tools/ToolLayout';
import PercentageCalculatorTool from '@/components/tools/PercentageCalculatorTool';
import { getToolBySlug } from '@/lib/tools-data';
import { buildToolMetadata } from '@/lib/seo-config';

export const metadata: Metadata = buildToolMetadata('percentage-calculator');

export default function PercentageCalculatorPage() {
  const tool = getToolBySlug('percentage-calculator');
  if (!tool) notFound();

  return (
    <ToolLayout tool={tool}>
      <PercentageCalculatorTool />
    </ToolLayout>
  );
}
