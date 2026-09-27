import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ToolLayout from '@/components/tools/ToolLayout';
import JsonFormatterTool from '@/components/tools/JsonFormatterTool';
import { getToolBySlug } from '@/lib/tools-data';

export const metadata: Metadata = {
  title: 'Free JSON Formatter & Validator — Beautify, Minify & Inspect | MultiZest',
  description:
    'Format, beautify, minify, and validate JSON data with syntax highlighting, line-numbered errors, and interactive collapsible tree view. 100% client-side privacy.',
  openGraph: {
    title: 'Free JSON Formatter & Validator — Beautify, Minify & Inspect | MultiZest',
    description:
      'Format, beautify, minify, and validate JSON data with syntax highlighting and tree view.',
    url: 'https://multizest.com/tools/json-formatter',
  },
  alternates: {
    canonical: 'https://multizest.com/tools/json-formatter',
  },
};

export default function JsonFormatterPage() {
  const tool = getToolBySlug('json-formatter');
  if (!tool) notFound();

  return (
    <ToolLayout tool={tool}>
      <JsonFormatterTool />
    </ToolLayout>
  );
}
