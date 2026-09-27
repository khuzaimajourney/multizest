'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Sparkles, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { TOOLS_DATA } from '@/lib/tools-data';

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTools = searchQuery.trim()
    ? TOOLS_DATA.filter(
        (tool) =>
          tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tool.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tool.categoryName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <section className="relative overflow-hidden pt-8 pb-16 md:pt-14 md:pb-24 border-b border-slate-200/60 dark:border-slate-800/80">
      {/* Decorative ambient gradient backdrop */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-500/15 via-violet-500/15 to-amber-500/15 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
        {/* Subtle pill badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-200 dark:border-blue-900/60 bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>100% Client-Side In-Browser Processing — No Server Uploads</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
          Free Online Tools to{' '}
          <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-amber-500 bg-clip-text text-transparent">
            Simplify Your Work
          </span>
        </h1>

        {/* Subheading */}
        <p className="mt-5 text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Compress images, convert PDFs, generate QR codes, and more — all in your browser, 100% free with complete privacy.
        </p>

        {/* Interactive Search Bar */}
        <div className="mt-8 max-w-xl mx-auto relative text-left">
          <div className="relative flex items-center shadow-lg shadow-slate-200/50 dark:shadow-slate-950/50 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus-within:border-blue-500 dark:focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
            <Search className="w-5 h-5 text-slate-400 ml-4 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tools (e.g. compress, PDF, QR code, word counter)..."
              className="w-full py-4 pl-3 pr-4 text-sm sm:text-base bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="mr-3 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                Clear
              </button>
            )}
          </div>

          {/* Autocomplete Search Dropdown */}
          {searchQuery.trim() && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 z-30 max-h-80 overflow-y-auto">
              {filteredTools.length > 0 ? (
                filteredTools.map((tool) => (
                  <Link
                    key={tool.id}
                    href={`/tools/${tool.slug}`}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
                  >
                    <div>
                      <div className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {tool.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                        {tool.shortDescription}
                      </div>
                    </div>
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-medium shrink-0 ml-2">
                      Open →
                    </span>
                  </Link>
                ))
              ) : (
                <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">
                  No matching tools found for &quot;{searchQuery}&quot;. Try searching for PDF, Image, or Word.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <Link
            href="/tools"
            className="px-6 py-3.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 active:scale-98 transition-all inline-flex items-center gap-2"
          >
            <span>Explore All Tools</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/tools/pdf-to-image"
            className="px-6 py-3.5 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-all inline-flex items-center gap-2"
          >
            <span>Convert PDF Now</span>
          </Link>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-medium text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Files never leave your browser</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Zero installation or login</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Forever Free</span>
          </div>
        </div>
      </div>
    </section>
  );
}
