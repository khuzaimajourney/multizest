import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ToolLayout from '@/components/tools/ToolLayout';
import Base64Tool from '@/components/tools/Base64Tool';
import { getToolBySlug } from '@/lib/tools-data';

export const metadata: Metadata = {
  title: 'Free Base64 Encoder & Decoder — Text & File Conversion | MultiZest',
  description:
    'Encode and decode strings and binary files to and from Base64 format. Generate data: URIs for CSS/HTML or download decoded files directly in your browser.',
  openGraph: {
    title: 'Free Base64 Encoder & Decoder — Text & File Conversion | MultiZest',
    description:
      'Encode and decode text and files to Base64 format with optional data: URI headers.',
    url: 'https://multizest.com/tools/base64-encoder-decoder',
  },
  alternates: {
    canonical: 'https://multizest.com/tools/base64-encoder-decoder',
  },
};

export default function Base64Page() {
  const tool = getToolBySlug('base64-encoder-decoder');
  if (!tool) notFound();

  return (
    <ToolLayout tool={tool}>
      <Base64Tool />
    </ToolLayout>
  );
}
