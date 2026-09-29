import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ToolLayout from '@/components/tools/ToolLayout';
import Base64Tool from '@/components/tools/Base64Tool';
import { getToolBySlug } from '@/lib/tools-data';
import { buildToolMetadata } from '@/lib/seo-config';

export const metadata: Metadata = buildToolMetadata('base64-encoder-decoder');

export default function Base64Page() {
  const tool = getToolBySlug('base64-encoder-decoder');
  if (!tool) notFound();

  return (
    <ToolLayout tool={tool}>
      <Base64Tool />
    </ToolLayout>
  );
}
