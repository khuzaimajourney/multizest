import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ToolLayout from '@/components/tools/ToolLayout';
import BmiCalculatorTool from '@/components/tools/BmiCalculatorTool';
import { getToolBySlug } from '@/lib/tools-data';

export const metadata: Metadata = {
  title: 'Free BMI Calculator — Body Mass Index, Healthy Weight & BMR | MultiZest',
  description:
    'Calculate your Body Mass Index (BMI) using metric or imperial units. Features WHO category indicators, visual spectrum gauge, healthy weight ranges, and BMR estimates.',
  openGraph: {
    title: 'Free BMI Calculator — Body Mass Index, Healthy Weight & BMR | MultiZest',
    description:
      'Calculate Body Mass Index (BMI) with visual category spectrum, healthy weight boundaries, and BMR insights.',
    url: 'https://multizest.com/tools/bmi-calculator',
  },
  alternates: {
    canonical: 'https://multizest.com/tools/bmi-calculator',
  },
};

export default function BmiCalculatorPage() {
  const tool = getToolBySlug('bmi-calculator');
  if (!tool) notFound();

  return (
    <ToolLayout tool={tool}>
      <BmiCalculatorTool />
    </ToolLayout>
  );
}
