import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ToolLayout from '@/components/tools/ToolLayout';
import SmartScannerTool from '@/components/tools/SmartScannerTool';
import { getToolBySlug } from '@/lib/tools-data';
import { buildToolMetadata } from '@/lib/seo-config';

export const metadata: Metadata = buildToolMetadata('smart-scanner');

export default function CategorizedSmartScannerPage() {
  const tool = getToolBySlug('smart-scanner');
  if (!tool) notFound();

  return (
    <ToolLayout tool={tool}>
      <SmartScannerTool />
    </ToolLayout>
  );
}
