import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ToolLayout from '@/components/tools/ToolLayout';
import TextDiffTool from '@/components/tools/TextDiffTool';
import { getToolBySlug } from '@/lib/tools-data';

export const metadata: Metadata = {
  title: 'Text Compare (Diff Checker) Free Online — Find Differences | MultiZest',
  description:
    'Compare two text files or code snippets side-by-side online. Highlights additions in green and deletions in red with word-by-word precision and zero server uploads.',
  keywords: [
    'text compare online',
    'diff checker free',
    'compare two texts online',
    'find differences between texts',
    'online diff tool',
  ],
  openGraph: {
    title: 'Text Compare (Diff Checker) Online Free — MultiZest',
    description:
      'Compare text drafts and code snippets with color-coded addition and deletion highlights in your browser.',
    url: 'https://multizest.com/tools/text-diff-checker',
    images: [
      {
        url: 'https://multizest.com/api/og?title=Text+Diff+Checker&category=Text+Tools&desc=Compare+two+texts+side-by-side+with+instant+visual+diff+highlights.',
        width: 1200,
        height: 630,
        alt: 'MultiZest Text Diff Checker Tool',
      },
    ],
  },
  alternates: {
    canonical: 'https://multizest.com/tools/text-diff-checker',
  },
};

export default function TextDiffPage() {
  const tool = getToolBySlug('text-diff-checker');
  if (!tool) notFound();

  return (
    <ToolLayout tool={tool}>
      <TextDiffTool />
    </ToolLayout>
  );
}
