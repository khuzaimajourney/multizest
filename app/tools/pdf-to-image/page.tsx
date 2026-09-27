import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ToolLayout from '@/components/tools/ToolLayout';
import PdfToImageTool from '@/components/tools/PdfToImageTool';
import { getToolBySlug } from '@/lib/tools-data';

export const metadata: Metadata = {
  title: 'Free PDF to Image Converter — Convert PDF Pages to JPG/PNG Online',
  description:
    'Convert any PDF file to high-quality JPG or PNG images instantly in your browser. 100% free, private, and secure with custom page ranges and zero server uploads.',
  openGraph: {
    title: 'Free PDF to Image Converter — Convert PDF Pages to JPG/PNG Online',
    description:
      'Convert any PDF file to high-quality JPG or PNG images instantly in your browser with zero server uploads.',
    url: 'https://multizest.com/tools/pdf-to-image',
  },
  alternates: {
    canonical: 'https://multizest.com/tools/pdf-to-image',
  },
};

export default function PdfToImagePage() {
  const tool = getToolBySlug('pdf-to-image');
  if (!tool) notFound();

  return (
    <ToolLayout tool={tool}>
      <PdfToImageTool />
    </ToolLayout>
  );
}
