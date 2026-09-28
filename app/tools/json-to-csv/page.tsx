import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ToolLayout from '@/components/tools/ToolLayout';
import JsonToCsvTool from '@/components/tools/JsonToCsvTool';
import { getToolBySlug } from '@/lib/tools-data';

export const metadata: Metadata = {
  title: 'JSON to CSV Converter Free Online — Parse JSON to Excel | MultiZest',
  description:
    'Convert JSON data and arrays into CSV spreadsheet format instantly in your browser. Auto-flattens nested objects, includes live table preview, and zero server uploads.',
  keywords: [
    'json to csv converter',
    'convert json to excel online',
    'json to spreadsheet free',
    'flatten nested json to csv',
    'client side json converter',
  ],
  openGraph: {
    title: 'JSON to CSV Converter Online Free — MultiZest',
    description:
      'Transform nested JSON objects and arrays into clean, tabular CSV files right in your browser.',
    url: 'https://multizest.com/tools/json-to-csv',
    images: [
      {
        url: 'https://multizest.com/api/og?title=JSON+to+CSV&category=Developer+Tools&desc=Convert+nested+JSON+into+clean+CSV+spreadsheets+instantly.',
        width: 1200,
        height: 630,
        alt: 'MultiZest JSON to CSV Tool',
      },
    ],
  },
  alternates: {
    canonical: 'https://multizest.com/tools/json-to-csv',
  },
};

export default function JsonToCsvPage() {
  const tool = getToolBySlug('json-to-csv');
  if (!tool) notFound();

  return (
    <ToolLayout tool={tool}>
      <JsonToCsvTool />
    </ToolLayout>
  );
}
