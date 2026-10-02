import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Zap,
  Lock,
  FileText,
  Image as ImageIcon,
  FileEdit,
  QrCode,
  Code,
  Calculator,
  Video,
  Globe,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { TOOL_CATEGORIES, TOOLS_DATA } from '@/lib/tools-data';

export default function SeoContentSection() {
  const topSearchClusters = [
    {
      category: 'PDF Tools',
      icon: FileText,
      href: '/categories/pdf-tools',
      queries: [
        { label: 'PDF to Image (JPG/PNG)', href: '/tools/pdf-to-image' },
        { label: 'Merge PDF Files Free', href: '/tools/merge-pdf' },
        { label: 'Compress PDF (Reduce KB)', href: '/tools/compress-pdf' },
        { label: 'Split PDF Pages', href: '/tools/split-pdf' },
        { label: 'Rotate PDF Permanently', href: '/tools/rotate-pdf' },
      ],
    },
    {
      category: 'Image Tools',
      icon: ImageIcon,
      href: '/categories/image-tools',
      queries: [
        { label: 'Compress Images to 50KB/100KB', href: '/tools/image-compressor' },
        { label: 'Resize Image in Pixels', href: '/tools/image-resizer' },
        { label: 'Convert JPG to PNG & WebP', href: '/tools/image-converter' },
        { label: 'Remove Background from Image', href: '/tools/remove-background' },
        { label: 'Crop Photo Circle / 16:9', href: '/tools/image-cropper' },
        { label: 'Add Watermark to Photo', href: '/tools/watermark-image' },
      ],
    },
    {
      category: 'Text & Writing',
      icon: FileEdit,
      href: '/categories/text-tools',
      queries: [
        { label: 'Word Counter & Character Count', href: '/tools/word-counter' },
        { label: 'Text Case Converter', href: '/tools/case-converter' },
        { label: 'Text to Speech Natural Voice', href: '/tools/text-to-speech' },
        { label: 'Text Difference Checker', href: '/tools/text-diff-checker' },
        { label: 'Lorem Ipsum Dummy Text', href: '/tools/lorem-ipsum-generator' },
      ],
    },
    {
      category: 'Generators & Web',
      icon: QrCode,
      href: '/categories/generator-tools',
      queries: [
        { label: 'QR Code Generator with Logo', href: '/tools/qr-code-generator' },
        { label: 'Strong Password Maker', href: '/tools/password-generator' },
        { label: 'HEX & RGB Color Picker', href: '/tools/color-picker' },
        { label: 'SEO Meta Tags Generator', href: '/tools/meta-tags-generator' },
        { label: 'UTM Campaign URL Builder', href: '/tools/utm-builder' },
      ],
    },
    {
      category: 'Developer Utilities',
      icon: Code,
      href: '/categories/developer-tools',
      queries: [
        { label: 'JSON Formatter & Validator', href: '/tools/json-formatter' },
        { label: 'Base64 Encoder / Decoder', href: '/tools/base64-encoder-decoder' },
        { label: 'GitHub Markdown Live Preview', href: '/tools/markdown-preview' },
        { label: 'JSON to CSV Converter', href: '/tools/json-to-csv' },
      ],
    },
    {
      category: 'Calculators & Media',
      icon: Calculator,
      href: '/categories/calculator-tools',
      queries: [
        { label: 'Age Calculator by Birthday', href: '/tools/age-calculator' },
        { label: 'Percentage Increase Calculator', href: '/tools/percentage-calculator' },
        { label: 'BMI Body Mass Index Tool', href: '/tools/bmi-calculator' },
        { label: 'Video to Audio MP3 Extractor', href: '/tools/video-to-audio' },
        { label: 'Images to PDF Document Album', href: '/tools/image-to-pdf' },
      ],
    },
  ];

  return (
    <section className="py-16 sm:py-24 border-t border-slate-200/80 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* SEO Header & Semantic Narrative */}
        <div className="max-w-4xl mx-auto text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-200 dark:border-blue-900/60 bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Topical Authority & Privacy Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
            Free Online Tools Built for Speed, Accuracy, and Absolute Privacy
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            MultiZest delivers a complete suite of browser-native utilities designed for modern
            professionals, students, developers, and creators. Unlike legacy online conversion
            websites that force you to upload confidential files to cloud servers, MultiZest
            executes 100% of tasks locally inside your device sandbox.
          </p>
        </div>

        {/* 3 Value Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Zero Server Uploads & GDPR/HIPAA Friendly
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Your sensitive financial records, medical documents, private photos, and proprietary
              code never leave your machine. Processing happens via client-side WebAssembly, HTML5
              Canvas, and Web Workers.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Instant Processing Without Server Queues
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Skip multi-minute upload delays and artificial cloud queue timers. MultiZest leverages
              your computer or smartphone CPU/GPU to compress, format, and render results in
              milliseconds.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Unlimited Free Access with No Registration
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              No subscription paywalls, no daily 3-task limits, no watermarks, and no sign-up
              prompts. Enjoy unrestrained access to all 30+ utilities anytime, anywhere.
            </p>
          </div>
        </div>

        {/* Popular Search Keywords & Silo Links Grid */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-10 shadow-sm">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-6 mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Explore Popular Online Tools by Category
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Browse our verified browser tools covering PDF, Image, Code, and Marketing tasks.
              </p>
            </div>
            <Link
              href="/tools"
              className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
            >
              <span>View Directory ({TOOLS_DATA.length} Tools)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {topSearchClusters.map((cluster) => {
              const Icon = cluster.icon;
              return (
                <div key={cluster.category} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                      <Icon className="w-4 h-4" />
                    </div>
                    <Link
                      href={cluster.href}
                      className="font-bold text-sm text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {cluster.category}
                    </Link>
                  </div>
                  <ul className="space-y-1.5 pl-6 border-l-2 border-slate-100 dark:border-slate-800">
                    {cluster.queries.map((q) => (
                      <li key={q.label}>
                        <Link
                          href={q.href}
                          className="text-xs text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors block py-0.5"
                        >
                          {q.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
