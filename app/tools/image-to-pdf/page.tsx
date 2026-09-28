import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ToolLayout from '@/components/tools/ToolLayout';
import ImageToPdfTool from '@/components/tools/ImageToPdfTool';
import { getToolBySlug } from '@/lib/tools-data';

export const metadata: Metadata = {
  title: 'Image to PDF Converter Free Online — JPG/PNG to PDF | MultiZest',
  description:
    'Combine multiple JPG, PNG, and WebP photos into one organized PDF booklet. Drag to reorder, configure A4 margins, and download with zero server uploads.',
  keywords: [
    'image to pdf converter',
    'jpg to pdf free',
    'png to pdf online',
    'combine photos into pdf',
    'convert picture to pdf document',
  ],
  openGraph: {
    title: 'Image to PDF Converter Online Free — MultiZest',
    description:
      'Easily turn multiple images into a single professional PDF document right in your browser.',
    url: 'https://multizest.com/tools/image-to-pdf',
    images: [
      {
        url: 'https://multizest.com/api/og?title=Image+to+PDF&category=Media+Tools&desc=Convert+JPG+and+PNG+photos+into+a+clean+PDF+document.',
        width: 1200,
        height: 630,
        alt: 'MultiZest Image to PDF Tool',
      },
    ],
  },
  alternates: {
    canonical: 'https://multizest.com/tools/image-to-pdf',
  },
};

export default function ImageToPdfPage() {
  const tool = getToolBySlug('image-to-pdf');
  if (!tool) notFound();

  return (
    <ToolLayout tool={tool}>
      <ImageToPdfTool />
    </ToolLayout>
  );
}
