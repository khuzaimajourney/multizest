import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ToolLayout from '@/components/tools/ToolLayout';
import TextToSpeechTool from '@/components/tools/TextToSpeechTool';
import { getToolBySlug } from '@/lib/tools-data';

export const metadata: Metadata = {
  title: 'Free Text to Speech Reader — Natural Voice Audio Online | MultiZest',
  description:
    'Listen to any text read aloud with natural synthesized voices, pitch adjustment, and adjustable playback speeds. 100% private, powered by the Web Speech API.',
  openGraph: {
    title: 'Free Text to Speech Reader — Natural Voice Audio Online | MultiZest',
    description:
      'Listen to any text read aloud with natural synthesized voices and speed controls.',
    url: 'https://multizest.com/tools/text-to-speech',
  },
  alternates: {
    canonical: 'https://multizest.com/tools/text-to-speech',
  },
};

export default function TextToSpeechPage() {
  const tool = getToolBySlug('text-to-speech');
  if (!tool) notFound();

  return (
    <ToolLayout tool={tool}>
      <TextToSpeechTool />
    </ToolLayout>
  );
}
