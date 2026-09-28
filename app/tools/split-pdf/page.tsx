import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ToolLayout from '@/components/tools/ToolLayout';
import SplitPdfTool from '@/components/tools/SplitPdfTool';
import { getToolBySlug } from '@/lib/tools-data';

export const metadata: Metadata = {
  title: 'Split PDF Online Free — Extract Pages from PDF | MultiZest',
  description:
    'Split PDF documents online into individual pages or extract custom page ranges in seconds. 100% free, client-side private, and no file size limits.',
  keywords: [
    'split pdf online free',
    'extract pages from pdf',
    'separate pdf pages',
    'pdf splitter free',
    'burst pdf to zip',
  ],
  openGraph: {
    title: 'Split PDF Online Free — MultiZest',
    description:
      'Extract specific pages or break a PDF into separate files directly in your browser.',
    url: 'https://multizest.com/tools/split-pdf',
    images: [
      {
        url: 'https://multizest.com/api/og?title=Split+PDF&category=PDF+Tools&desc=Extract+specific+pages+or+burst+into+separate+PDF+files.',
        width: 1200,
        height: 630,
        alt: 'MultiZest Split PDF Tool',
      },
    ],
  },
  alternates: {
    canonical: 'https://multizest.com/tools/split-pdf',
  },
};

export default function SplitPdfPage() {
  const tool = getToolBySlug('split-pdf');
  if (!tool) notFound();

  return (
    <ToolLayout tool={tool}>
      <SplitPdfTool />
    </ToolLayout>
  );
}
