import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ToolLayout from '@/components/tools/ToolLayout';
import LoremIpsumTool from '@/components/tools/LoremIpsumTool';
import { getToolBySlug } from '@/lib/tools-data';
import { buildToolMetadata } from '@/lib/seo-config';

export const metadata: Metadata = buildToolMetadata('lorem-ipsum-generator');

export default function LoremIpsumPage() {
  const tool = getToolBySlug('lorem-ipsum-generator');
  if (!tool) notFound();

  return (
    <ToolLayout tool={tool}>
      <LoremIpsumTool />
    </ToolLayout>
  );
}
