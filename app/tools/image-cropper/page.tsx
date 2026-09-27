import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ToolLayout from '@/components/tools/ToolLayout';
import ImageCropperTool from '@/components/tools/ImageCropperTool';
import { getToolBySlug } from '@/lib/tools-data';

export const metadata: Metadata = {
  title: 'Free Online Image Cropper — Crop & Rotate Photos | MultiZest',
  description:
    'Crop and rotate your photos with custom aspect ratios (1:1, 16:9, 4:3) for Instagram, YouTube, and avatars. High quality canvas rendering directly in your browser.',
  openGraph: {
    title: 'Free Online Image Cropper — Crop & Rotate Photos | MultiZest',
    description:
      'Crop, rotate, and adjust photos with precision aspect ratios for social media and profiles.',
    url: 'https://multizest.com/tools/image-cropper',
  },
  alternates: {
    canonical: 'https://multizest.com/tools/image-cropper',
  },
};

export default function ImageCropperPage() {
  const tool = getToolBySlug('image-cropper');
  if (!tool) notFound();

  return (
    <ToolLayout tool={tool}>
      <ImageCropperTool />
    </ToolLayout>
  );
}
