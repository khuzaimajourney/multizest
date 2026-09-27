'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import JsonLd from '../shared/JsonLd';
import { generateFAQSchema } from '@/lib/seo-config';

export const HOMEPAGE_FAQS = [
  {
    question: 'Is MultiZest really 100% free to use?',
    answer:
      'Yes, all tools on MultiZest are completely free with zero hidden charges, subscription fees, or paywalled features. We are supported by non-intrusive banner advertising via Google AdSense.',
  },
  {
    question: 'Do you upload, store, or view my files on your servers?',
    answer:
      'Never. MultiZest is architected from the ground up to be 100% client-side. When you compress an image or convert a PDF, all processing is handled locally by your web browser using HTML5 Canvas, Web Workers, and WebAssembly. Your files never touch our servers.',
  },
  {
    question: 'What types of tools are currently available on MultiZest?',
    answer:
      'We currently offer five core utilities: PDF to Image Converter, Image Compressor, Image Resizer, Word Counter & Text Analyzer, and QR Code Generator. We actively add new tools and enhancements every month.',
  },
  {
    question: 'Do I need to register an account or provide my email address?',
    answer:
      'No. There is no sign-up form, login, or email requirement. You can open any tool and start working immediately without delays or password setups.',
  },
  {
    question: 'Is MultiZest safe and confidential for personal or business documents?',
    answer:
      'Yes! Because your documents, images, and texts never leave your device or travel over the internet to a third-party server, MultiZest provides complete privacy protection, complying with strict confidentiality standards.',
  },
  {
    question: 'Which web browsers and operating systems are supported?',
    answer:
      'MultiZest works seamlessly across all modern browsers that support HTML5 and JavaScript, including Google Chrome, Apple Safari, Mozilla Firefox, Microsoft Edge, and Opera on Windows, macOS, Linux, iOS, and Android.',
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      <JsonLd data={generateFAQSchema(HOMEPAGE_FAQS)} />
      <section className="py-14 sm:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">
            <HelpCircle className="w-4 h-4" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Everything you need to know about our privacy architecture, file formats, and tool availability.
          </p>
        </div>

        <div className="space-y-3">
          {HOMEPAGE_FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.question}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleFAQ(index)}
                  className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-blue-600 dark:text-blue-400' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/60">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
