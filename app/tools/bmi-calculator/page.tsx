import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ToolLayout from '@/components/tools/ToolLayout';
import BmiCalculatorTool from '@/components/tools/BmiCalculatorTool';
import { getToolBySlug } from '@/lib/tools-data';
import { buildToolMetadata } from '@/lib/seo-config';

export const metadata: Metadata = buildToolMetadata('bmi-calculator');

export default function BmiCalculatorPage() {
  const tool = getToolBySlug('bmi-calculator');
  if (!tool) notFound();

  return (
    <ToolLayout tool={tool}>
      <BmiCalculatorTool />
    </ToolLayout>
  );
}
