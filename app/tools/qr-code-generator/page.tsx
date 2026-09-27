import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ToolLayout from '@/components/tools/ToolLayout';
import QrCodeTool from '@/components/tools/QrCodeTool';
import { getToolBySlug } from '@/lib/tools-data';

export const metadata: Metadata = {
  title: 'Free QR Code Generator — Create Custom QR Codes Instantly',
  description:
    'Generate customized QR codes for URLs, plain text, WiFi credentials, emails, and phone numbers. Customize brand colors and download high-resolution PNG or SVG.',
  openGraph: {
    title: 'Free QR Code Generator — Create Custom QR Codes Instantly',
    description:
      'Generate customized QR codes for URLs, plain text, WiFi credentials, emails, and phone numbers. Download high-resolution PNG or SVG.',
    url: 'https://multizest.com/tools/qr-code-generator',
  },
  alternates: {
    canonical: 'https://multizest.com/tools/qr-code-generator',
  },
};

export default function QrCodePage() {
  const tool = getToolBySlug('qr-code-generator');
  if (!tool) notFound();

  return (
    <ToolLayout tool={tool}>
      <QrCodeTool />
    </ToolLayout>
  );
}
