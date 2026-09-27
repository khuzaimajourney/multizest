import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ToolLayout from '@/components/tools/ToolLayout';
import MarkdownPreviewTool from '@/components/tools/MarkdownPreviewTool';
import { getToolBySlug } from '@/lib/tools-data';

export const metadata: Metadata = {
  title: 'Free Markdown Live Editor & Previewer — Split Screen GFM | MultiZest',
  description:
    'Write GitHub-Flavored Markdown with real-time rendered HTML preview, formatting toolbar, and one-click export to HTML or .md files.',
  openGraph: {
    title: 'Free Markdown Live Editor & Previewer — Split Screen GFM | MultiZest',
    description:
      'Write and preview Markdown side-by-side with formatting toolbar and one-click export.',
    url: 'https://multizest.com/tools/markdown-preview',
  },
  alternates: {
    canonical: 'https://multizest.com/tools/markdown-preview',
  },
};

export default function MarkdownPreviewPage() {
  const tool = getToolBySlug('markdown-preview');
  if (!tool) notFound();

  return (
    <ToolLayout tool={tool}>
      <MarkdownPreviewTool />
    </ToolLayout>
  );
}
