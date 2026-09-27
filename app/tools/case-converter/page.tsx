import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ToolLayout from '@/components/tools/ToolLayout';
import CaseConverterTool from '@/components/tools/CaseConverterTool';
import { getToolBySlug } from '@/lib/tools-data';

export const metadata: Metadata = {
  title: 'Free Case Converter — UPPERCASE, lowercase, Title Case Online | MultiZest',
  description:
    'Convert text case between UPPERCASE, lowercase, Title Case, Sentence case, camelCase, PascalCase, snake_case, and kebab-case instantly with one-click copy.',
  openGraph: {
    title: 'Free Case Converter — UPPERCASE, lowercase, Title Case Online | MultiZest',
    description:
      'Convert text between UPPERCASE, lowercase, Title Case, camelCase, snake_case, and kebab-case in one click.',
    url: 'https://multizest.com/tools/case-converter',
  },
  alternates: {
    canonical: 'https://multizest.com/tools/case-converter',
  },
};

export default function CaseConverterPage() {
  const tool = getToolBySlug('case-converter');
  if (!tool) notFound();

  return (
    <ToolLayout tool={tool}>
      <CaseConverterTool />
    </ToolLayout>
  );
}
