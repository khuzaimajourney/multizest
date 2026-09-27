'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  Sparkles,
  ChevronDown,
  ArrowRight,
} from 'lucide-react';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import AdPlaceholder from '@/components/shared/AdPlaceholder';
import JsonLd from '@/components/shared/JsonLd';
import ToolCard from '@/components/tools/ToolCard';
import ToolRating from '@/components/tools/ToolRating';
import ShareTool from '@/components/tools/ShareTool';
import { ToolItem } from '@/lib/types';
import { getRelatedTools } from '@/lib/tools-data';
import { useToolHistory } from '@/hooks/useToolHistory';
import {
  generateWebApplicationSchema,
  generateFAQSchema,
  generateHowToSchema,
} from '@/lib/seo-config';

interface ToolLayoutProps {
  tool: ToolItem;
  children: React.ReactNode;
}

export default function ToolLayout({ tool, children }: ToolLayoutProps) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const relatedTools = getRelatedTools(tool.slug, 3);
  const { addRecentTool } = useToolHistory();

  // Track tool in recent history
  useEffect(() => {
    addRecentTool(tool.slug);
  }, [tool.slug, addRecentTool]);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <>
      {/* Structured Data */}
      <JsonLd data={generateWebApplicationSchema(tool)} />
      <JsonLd data={generateFAQSchema(tool.faqs)} />
      <JsonLd data={generateHowToSchema(tool)} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs
          items={[
            { name: 'Tools', href: '/tools' },
            { name: tool.categoryName, href: `/categories/${tool.category}` },
            { name: tool.name, href: `/tools/${tool.slug}` },
          ]}
        />

        {/* Tool Header Section */}
        <header className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/categories/${tool.category}`}
                className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors"
              >
                {tool.categoryName}
              </Link>
              {tool.badge && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                  {tool.badge}
                </span>
              )}
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                100% Client-Side Privacy
              </span>
            </div>

            {/* Rating & Share buttons */}
            <div className="flex items-center gap-2">
              <ToolRating
                toolSlug={tool.slug}
                initialRating={tool.rating || 4.9}
                initialCount={tool.ratingCount || 280}
              />
              <ShareTool title={tool.name} />
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            {tool.name}
          </h1>
          <p className="mt-2 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
            {tool.shortDescription}
          </p>
        </header>

        {/* Ad Placement: Above Tool Interface */}
        <AdPlaceholder slot="tool-page-above-tool" format="responsive" />

        {/* Main Grid: Tool Area + Desktop Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 my-8">
          {/* Main Interactive Tool Container */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-7 shadow-sm">
              {children}
            </div>

            {/* Ad Placement: Below Tool Interface */}
            <AdPlaceholder slot="tool-page-below-tool" format="responsive" />

            {/* "How to Use This Tool" Section */}
            <section className="mt-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                  <Sparkles className="w-5 h-5" />
                </span>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  How to Use the {tool.name}
                </h2>
              </div>

              <div className="space-y-4">
                {tool.howToSteps.map((step, idx) => (
                  <div key={step.title} className="flex gap-4 items-start">
                    <span className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/20">
                      {idx + 1}
                    </span>
                    <div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white">
                        {step.title}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* "What Does This Tool Do?" Section */}
            <section className="mt-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                What Does the {tool.name} Do?
              </h2>
              <div className="prose dark:prose-invert max-w-none text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed space-y-4">
                <p>{tool.longDescription}</p>
                <p>
                  Because MultiZest utilizes modern browser APIs — including HTML5 Canvas, Web
                  Workers, and WebAssembly — all calculations execute directly on your local device.
                  This ensures zero waiting in server queues, no file transfer data caps, and absolute
                  certainty that your confidential information remains strictly on your machine.
                </p>
              </div>
            </section>

            {/* "Key Features" Section */}
            <section className="mt-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                Key Features
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {tool.features.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
                  >
                    <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Tool FAQ Section */}
            <section className="mt-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Frequently Asked Questions
                </h2>
              </div>

              <div className="space-y-3">
                {tool.faqs.map((faq, index) => {
                  const isOpen = openFaqIndex === index;
                  return (
                    <div
                      key={faq.question}
                      className="border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => toggleFaq(index)}
                        className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        aria-expanded={isOpen}
                      >
                        <span>{faq.question}</span>
                        <ChevronDown
                          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                            isOpen ? 'rotate-180 text-blue-600' : ''
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-4 sm:px-5 pb-5 pt-1 text-sm text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800 leading-relaxed">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Desktop Right Sidebar */}
          <aside className="space-y-6">
            <div className="sticky top-24 space-y-6">
              <AdPlaceholder slot="tool-page-sidebar-ad" format="rectangle" />

              {/* Quick info card */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm text-xs space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  Tool Information
                </h4>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  <span>Processing:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">100% Client-Side</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  <span>Privacy:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">Zero Server Uploads</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  <span>Cost:</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">Free Forever</span>
                </div>
                <div className="flex justify-between py-1.5 text-slate-500 dark:text-slate-400">
                  <span>Rating:</span>
                  <span className="font-semibold text-amber-500">★ {tool.rating || 4.9} / 5.0</span>
                </div>
              </div>

              {/* Helpful links card */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 text-white shadow-md">
                <h4 className="font-bold text-sm">Need help or found a bug?</h4>
                <p className="text-xs text-blue-100 mt-1.5 leading-relaxed">
                  Have a suggestion for a new tool or experiencing an issue? Send our team a message anytime.
                </p>
                <Link
                  href="/contact"
                  className="mt-3.5 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-white text-blue-700 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <span>Contact Support</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </aside>
        </div>

        {/* Related Tools Section */}
        <section className="mt-14 pt-10 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Related Free Tools
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Explore more client-side utilities to streamline your digital tasks.
              </p>
            </div>
            <Link
              href="/tools"
              className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
            >
              <span>View All 20 Tools</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedTools.map((relTool) => (
              <ToolCard key={relTool.id} tool={relTool} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
