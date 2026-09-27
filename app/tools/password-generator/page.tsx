import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ToolLayout from '@/components/tools/ToolLayout';
import PasswordGeneratorTool from '@/components/tools/PasswordGeneratorTool';
import { getToolBySlug } from '@/lib/tools-data';

export const metadata: Metadata = {
  title: 'Free Strong Password Generator — Cryptographically Secure | MultiZest',
  description:
    'Generate cryptographically strong random passwords with customizable length, symbols, and security audit meters. Powered by Web Crypto API with zero server transmission.',
  openGraph: {
    title: 'Free Strong Password Generator — Cryptographically Secure | MultiZest',
    description:
      'Generate uncrackable random passwords with custom symbols, numbers, and strength meters.',
    url: 'https://multizest.com/tools/password-generator',
  },
  alternates: {
    canonical: 'https://multizest.com/tools/password-generator',
  },
};

export default function PasswordGeneratorPage() {
  const tool = getToolBySlug('password-generator');
  if (!tool) notFound();

  return (
    <ToolLayout tool={tool}>
      <PasswordGeneratorTool />
    </ToolLayout>
  );
}
