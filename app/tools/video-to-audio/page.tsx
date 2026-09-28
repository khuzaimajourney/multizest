import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ToolLayout from '@/components/tools/ToolLayout';
import VideoToAudioTool from '@/components/tools/VideoToAudioTool';
import { getToolBySlug } from '@/lib/tools-data';

export const metadata: Metadata = {
  title: 'Video to Audio Converter (MP4 to MP3/WAV) Free Online | MultiZest',
  description:
    'Extract high-quality audio tracks from MP4, WebM, and MOV videos directly in your browser. 100% free, client-side private, and zero server uploads.',
  keywords: [
    'video to audio converter',
    'mp4 to mp3 free online',
    'extract audio from video',
    'rip sound from video',
    'convert video to wav',
  ],
  openGraph: {
    title: 'Video to Audio Converter Free Online — MultiZest',
    description:
      'Extract crystal-clear sound from video files directly on your device without server uploads.',
    url: 'https://multizest.com/tools/video-to-audio',
    images: [
      {
        url: 'https://multizest.com/api/og?title=Video+to+Audio&category=Media+Tools&desc=Extract+crystal-clear+soundtracks+from+videos+in+seconds.',
        width: 1200,
        height: 630,
        alt: 'MultiZest Video to Audio Tool',
      },
    ],
  },
  alternates: {
    canonical: 'https://multizest.com/tools/video-to-audio',
  },
};

export default function VideoToAudioPage() {
  const tool = getToolBySlug('video-to-audio');
  if (!tool) notFound();

  return (
    <ToolLayout tool={tool}>
      <VideoToAudioTool />
    </ToolLayout>
  );
}
