import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Zap, Lock, HelpCircle, CheckCircle, ArrowRight } from 'lucide-react';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import ToolCard from '@/components/tools/ToolCard';
import AdPlaceholder from '@/components/shared/AdPlaceholder';
import JsonLd from '@/components/shared/JsonLd';
import { TOOL_CATEGORIES, getToolsByCategory } from '@/lib/tools-data';
import { ToolCategory } from '@/lib/types';
import {
  SITE_CONFIG,
  generateCategoryBreadcrumbSchema,
  generateCategoryCollectionSchema,
  generateFAQSchema,
} from '@/lib/seo-config';

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

  const title = `${cat.name} — 100% Free Online Browser Tools (No Upload) | MultiZest`;
  const description = `${cat.description} Explore free, private client-side ${cat.name.toLowerCase()} with zero server uploads, no daily limits, and instant results.`;
  const canonicalUrl = `${SITE_CONFIG.url}/categories/${cat.slug}`;

  return {
    title,
    description,
    keywords: [
      cat.name.toLowerCase(),
      `free ${cat.name.toLowerCase()}`,
      `${cat.name.toLowerCase()} online`,
      `${cat.name.toLowerCase()} no upload`,
      `${cat.name.toLowerCase()} client side`,
      'free online tools',
      'browser utilities',
      'multizest',
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: SITE_CONFIG.name,
      locale: 'en_US',
      type: 'website',
      images: [
        {
          url: `${SITE_CONFIG.url}/api/og?title=${encodeURIComponent(cat.name)}&category=Tool+Category&desc=${encodeURIComponent(cat.description)}`,
          width: 1200,
          height: 630,
          alt: `${cat.name} — MultiZest`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: SITE_CONFIG.twitterHandle,
      images: [
        `${SITE_CONFIG.url}/api/og?title=${encodeURIComponent(cat.name)}&category=Tool+Category&desc=${encodeURIComponent(cat.description)}`,
      ],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params;
  const cat = TOOL_CATEGORIES.find((c) => c.slug === category);
  if (!cat) notFound();

  const tools = getToolsByCategory(cat.id as ToolCategory);

  const breadcrumbSchema = generateCategoryBreadcrumbSchema(cat);
  const collectionSchema = generateCategoryCollectionSchema(cat, tools);
  const faqSchema = cat.faqs && cat.faqs.length > 0 ? generateFAQSchema(cat.faqs) : null;

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={collectionSchema} />
      {faqSchema && <JsonLd data={faqSchema} />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <Breadcrumbs
          items={[
            { name: 'Tools', href: '/tools' },
            { name: cat.name, href: `/categories/${cat.slug}` },
          ]}
        />

        {/* Category Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/50 mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>100% Client-Side Privacy — {tools.length} Free Utilities</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {cat.name}
          </h1>
          <p className="mt-3 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            {cat.description}
          </p>
        </div>

        <AdPlaceholder slot={`category-${cat.slug}-top`} format="banner" />

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-10">
          {tools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>

        {/* Category Benefits Section */}
        {cat.benefits && cat.benefits.length > 0 && (
          <section className="my-14 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-10 shadow-sm">
            <div className="max-w-3xl mx-auto text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Why Choose MultiZest for {cat.name}?
              </h2>
              <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400">
                Designed from the ground up for maximum speed, security, and simplicity.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {cat.benefits.map((benefit, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold mb-3">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1.5">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Category FAQs Section */}
        {cat.faqs && cat.faqs.length > 0 && (
          <section className="my-14 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-10 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  Frequently Asked Questions
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Everything you need to know about our {cat.name.toLowerCase()} suite.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {cat.faqs.map((faq, idx) => (
                <details
                  key={idx}
                  className="group border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden transition-colors"
                >
                  <summary className="cursor-pointer p-4 sm:p-5 font-semibold text-slate-900 dark:text-white list-none flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <span>{faq.question}</span>
                    <span className="ml-4 text-blue-600 group-open:rotate-180 transition-transform">
                      ▼
                    </span>
                  </summary>
                  <div className="px-4 sm:px-5 pb-5 pt-1 text-sm text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800/80 leading-relaxed">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </section>
        )}

        <AdPlaceholder slot={`category-${cat.slug}-bottom`} format="responsive" />
      </div>
    </>
  );
}
