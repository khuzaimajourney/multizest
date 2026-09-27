import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ToolLayout from '@/components/tools/ToolLayout';
import CompressPdfTool from '@/components/tools/CompressPdfTool';
import { getToolBySlug } from '@/lib/tools-data';

export const metadata: Metadata = {
  title: 'Free PDF Compressor — Reduce PDF File Size Online | MultiZest',
  description:
    'Compress PDF files to reduce storage size while maintaining readability and crisp document typography. Selectable compression strengths and instant client-side privacy.',
  openGraph: {
    title: 'Free PDF Compressor — Reduce PDF File Size Online | MultiZest',
    description:
      'Reduce PDF file size online while maintaining readability. 100% private in-browser compression.',
    url: 'https://multizest.com/tools/compress-pdf',
  },
  alternates: {
    canonical: 'https://multizest.com/tools/compress-pdf',
  },
};

export default function CompressPdfPage() {
  const tool = getToolBySlug('compress-pdf');
  if (!tool) notFound();

  return (
    <ToolLayout tool={tool}>
      <CompressPdfTool />
    </ToolLayout>
  );
}
