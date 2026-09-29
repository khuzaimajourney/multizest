import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ToolLayout from '@/components/tools/ToolLayout';
import PasswordGeneratorTool from '@/components/tools/PasswordGeneratorTool';
import { getToolBySlug } from '@/lib/tools-data';
import { buildToolMetadata } from '@/lib/seo-config';

export const metadata: Metadata = buildToolMetadata('password-generator');

export default function PasswordGeneratorPage() {
  const tool = getToolBySlug('password-generator');
  if (!tool) notFound();

  return (
    <ToolLayout tool={tool}>
      <PasswordGeneratorTool />
    </ToolLayout>
  );
}
