import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ToolLayout from '@/components/tools/ToolLayout';
import ColorPickerTool from '@/components/tools/ColorPickerTool';
import { getToolBySlug } from '@/lib/tools-data';

export const metadata: Metadata = {
  title: 'Free Color Picker & Converter — HEX, RGB, HSL & WCAG Contrast | MultiZest',
  description:
    'Pick colors visually, convert across HEX, RGB, HSL, and CMYK formats, extract image palettes, and verify WCAG 2.1 accessibility contrast compliance.',
  openGraph: {
    title: 'Free Color Picker & Converter — HEX, RGB, HSL & WCAG Contrast | MultiZest',
    description:
      'Color picker, palette extractor, format converter, and WCAG accessibility contrast auditor.',
    url: 'https://multizest.com/tools/color-picker',
  },
  alternates: {
    canonical: 'https://multizest.com/tools/color-picker',
  },
};

export default function ColorPickerPage() {
  const tool = getToolBySlug('color-picker');
  if (!tool) notFound();

  return (
    <ToolLayout tool={tool}>
      <ColorPickerTool />
    </ToolLayout>
  );
}
