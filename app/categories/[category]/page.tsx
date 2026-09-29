import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import ToolCard from '@/components/tools/ToolCard';
import AdPlaceholder from '@/components/shared/AdPlaceholder';
import { TOOL_CATEGORIES, getToolsByCategory } from '@/lib/tools-data';
import { ToolCategory } from '@/lib/types';

interface PageProps {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  return TOOL_CATEGORIES.map((cat) => ({
    category: cat.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  const cat = TOOL_CATEGORIES.find((c) => c.slug === category);
  if (!cat) {
    return { title: 'Category Not Found' };
  }

  return {
    title: `${cat.name} — Free Online Utilities | MultiZest`,
    description: `${cat.description} 100% free, private browser-based utilities with no sign-up or file uploads.`,
    openGraph: {
      title: `${cat.name} — MultiZest`,
      description: cat.description,
      url: `/categories/${cat.slug}`,
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(cat.name)}&category=Category&desc=${encodeURIComponent(cat.description)}`,
          width: 1200,
          height: 630,
          alt: `${cat.name} - MultiZest`,
        },
      ],
    },
    alternates: {
      canonical: `/categories/${cat.slug}`,
    },
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params;
  const cat = TOOL_CATEGORIES.find((c) => c.slug === category);
  if (!cat) notFound();

  const tools = getToolsByCategory(cat.id as ToolCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <Breadcrumbs
        items={[
          { name: 'Tools', href: '/tools' },
          { name: cat.name, href: `/categories/${cat.slug}` },
        ]}
      />

      <div className="text-center max-w-3xl mx-auto mb-10">
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/50 mb-3 inline-block">
          Tool Category
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {cat.name}
        </h1>
        <p className="mt-3 text-base sm:text-lg text-slate-600 dark:text-slate-400">
          {cat.description}
        </p>
      </div>

      <AdPlaceholder slot={`category-${cat.slug}-top`} format="banner" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-10">
        {tools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>

      <AdPlaceholder slot={`category-${cat.slug}-bottom`} format="responsive" />
    </div>
  );
}
