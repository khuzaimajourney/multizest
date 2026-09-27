import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ToolLayout from '@/components/tools/ToolLayout';
import WordCounterTool from '@/components/tools/WordCounterTool';
import { getToolBySlug } from '@/lib/tools-data';

export const metadata: Metadata = {
  title: 'Free Online Word Counter — Count Words, Characters & Reading Time',
  description:
    'Instantly count words, characters, sentences, paragraphs, and estimated reading and speaking times for any text. Real-time stats with keyword density analysis.',
  openGraph: {
    title: 'Free Online Word Counter — Count Words, Characters & Reading Time',
    description:
      'Instantly count words, characters, sentences, paragraphs, and estimated reading and speaking times for any text.',
    url: 'https://multizest.com/tools/word-counter',
  },
  alternates: {
    canonical: 'https://multizest.com/tools/word-counter',
  },
};

export default function WordCounterPage() {
  const tool = getToolBySlug('word-counter');
  if (!tool) notFound();

  return (
    <ToolLayout tool={tool}>
      <WordCounterTool />
    </ToolLayout>
  );
}
