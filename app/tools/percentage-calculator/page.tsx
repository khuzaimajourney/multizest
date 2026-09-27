import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ToolLayout from '@/components/tools/ToolLayout';
import PercentageCalculatorTool from '@/components/tools/PercentageCalculatorTool';
import { getToolBySlug } from '@/lib/tools-data';

export const metadata: Metadata = {
  title: 'Free Percentage Calculator — Discounts, Increases & Changes | MultiZest',
  description:
    'Calculate discounts, percentage changes, increases, markups, and ratios with real-time solutions and step-by-step formula explanations.',
  openGraph: {
    title: 'Free Percentage Calculator — Discounts, Increases & Changes | MultiZest',
    description:
      'Solve any percentage calculation: X% of Y, discounts, margin growth, and percentage change.',
    url: 'https://multizest.com/tools/percentage-calculator',
  },
  alternates: {
    canonical: 'https://multizest.com/tools/percentage-calculator',
  },
};

export default function PercentageCalculatorPage() {
  const tool = getToolBySlug('percentage-calculator');
  if (!tool) notFound();

  return (
    <ToolLayout tool={tool}>
      <PercentageCalculatorTool />
    </ToolLayout>
  );
}
