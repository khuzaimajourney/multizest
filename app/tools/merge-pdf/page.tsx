import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ToolLayout from '@/components/tools/ToolLayout';
import MergePdfTool from '@/components/tools/MergePdfTool';
import { getToolBySlug } from '@/lib/tools-data';

export const metadata: Metadata = {
  title: 'Free Merge PDF Online — Combine Multiple PDFs into One | MultiZest',
  description:
    'Combine and merge multiple PDF documents into a single organized file in seconds. Drag-and-drop reordering, 100% free, private client-side execution with zero file uploads.',
  openGraph: {
    title: 'Free Merge PDF Online — Combine Multiple PDFs into One | MultiZest',
    description:
      'Combine multiple PDF documents into a single organized file. Fast, free, and 100% private.',
    url: 'https://multizest.com/tools/merge-pdf',
  },
  alternates: {
    canonical: 'https://multizest.com/tools/merge-pdf',
  },
};

export default function MergePdfPage() {
  const tool = getToolBySlug('merge-pdf');
  if (!tool) notFound();

  return (
    <ToolLayout tool={tool}>
      <MergePdfTool />
    </ToolLayout>
  );
}
