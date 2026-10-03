import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ToolLayout from '@/components/tools/ToolLayout';
import PassportPhotoTool from '@/components/tools/passport-photo/PassportPhotoTool';
import { getToolBySlug } from '@/lib/tools-data';
import { buildToolMetadata } from '@/lib/seo-config';

export const metadata: Metadata = buildToolMetadata('passport-photo');

export default function DirectPassportPhotoPage() {
  const tool = getToolBySlug('passport-photo');
  if (!tool) notFound();

  return (
    <ToolLayout tool={tool}>
      <PassportPhotoTool />
    </ToolLayout>
  );
}
