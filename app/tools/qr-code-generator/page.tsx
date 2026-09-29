import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ToolLayout from '@/components/tools/ToolLayout';
import QrCodeTool from '@/components/tools/QrCodeTool';
import { getToolBySlug } from '@/lib/tools-data';
import { buildToolMetadata } from '@/lib/seo-config';

export const metadata: Metadata = buildToolMetadata('qr-code-generator');

export default function QrCodePage() {
  const tool = getToolBySlug('qr-code-generator');
  if (!tool) notFound();

  return (
    <ToolLayout tool={tool}>
      <QrCodeTool />
    </ToolLayout>
  );
}
