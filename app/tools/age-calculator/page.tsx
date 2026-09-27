import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ToolLayout from '@/components/tools/ToolLayout';
import AgeCalculatorTool from '@/components/tools/AgeCalculatorTool';
import { getToolBySlug } from '@/lib/tools-data';

export const metadata: Metadata = {
  title: 'Free Exact Age Calculator — Years, Months, Days & Minutes | MultiZest',
  description:
    'Calculate chronological age down to the day, hour, and minute. Birthday countdown, day of the week born on, zodiac signs, and interval date math.',
  openGraph: {
    title: 'Free Exact Age Calculator — Years, Months, Days & Minutes | MultiZest',
    description:
      'Calculate exact age down to days and minutes, with birthday countdown and zodiac signs.',
    url: 'https://multizest.com/tools/age-calculator',
  },
  alternates: {
    canonical: 'https://multizest.com/tools/age-calculator',
  },
};

export default function AgeCalculatorPage() {
  const tool = getToolBySlug('age-calculator');
  if (!tool) notFound();

  return (
    <ToolLayout tool={tool}>
      <AgeCalculatorTool />
    </ToolLayout>
  );
}
