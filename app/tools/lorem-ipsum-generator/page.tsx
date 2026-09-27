import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ToolLayout from '@/components/tools/ToolLayout';
import LoremIpsumTool from '@/components/tools/LoremIpsumTool';
import { getToolBySlug } from '@/lib/tools-data';

export const metadata: Metadata = {
  title: 'Free Lorem Ipsum Generator — Dummy Text for Mockups | MultiZest',
  description:
    'Generate classic placeholder dummy text in paragraphs, sentences, or words with optional HTML paragraph tags. Free, instant, and copy-ready.',
  openGraph: {
    title: 'Free Lorem Ipsum Generator — Dummy Text for Mockups | MultiZest',
    description:
      'Generate dummy placeholder text in paragraphs, sentences, or words with optional HTML tag wrapping.',
    url: 'https://multizest.com/tools/lorem-ipsum-generator',
  },
  alternates: {
    canonical: 'https://multizest.com/tools/lorem-ipsum-generator',
  },
};

export default function LoremIpsumPage() {
  const tool = getToolBySlug('lorem-ipsum-generator');
  if (!tool) notFound();

  return (
    <ToolLayout tool={tool}>
      <LoremIpsumTool />
    </ToolLayout>
  );
}
