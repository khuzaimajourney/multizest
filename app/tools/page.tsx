'use client';

import React, { useState } from 'react';
import { Search, Sparkles } from 'lucide-react';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import ToolCard from '@/components/tools/ToolCard';
import AdPlaceholder from '@/components/shared/AdPlaceholder';
import { TOOLS_DATA, TOOL_CATEGORIES } from '@/lib/tools-data';

export default function AllToolsPage() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTools = TOOLS_DATA.filter((tool) => {
    const matchesCategory =
      activeCategory === 'all' || tool.category === activeCategory;
    const matchesSearch =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.categoryName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <Breadcrumbs items={[{ name: 'All Tools', href: '/tools' }]} />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">
          <Sparkles className="w-4 h-4" />
          <span>Full Tool Catalog</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          All Free Online Tools
        </h1>
        <p className="mt-3 text-base sm:text-lg text-slate-600 dark:text-slate-400">
          Explore our collection of lightning-fast, client-side tools. No account required, zero files uploaded to servers.
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-xl mx-auto mb-8">
        <div className="relative flex items-center shadow-md rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus-within:border-blue-500 transition-all">
          <Search className="w-5 h-5 text-slate-400 ml-4 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tools by name, feature, or keyword..."
            className="w-full py-3.5 pl-3 pr-4 text-sm bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="mr-3 text-xs text-slate-400 hover:text-slate-600 p-1"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
        <button
          type="button"
          onClick={() => setActiveCategory('all')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeCategory === 'all'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
          }`}
        >
          All Tools ({TOOLS_DATA.length})
        </button>

        {TOOL_CATEGORIES.map((cat) => {
          const count = TOOLS_DATA.filter((t) => t.category === cat.id).length;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              {cat.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Ad Placement */}
      <AdPlaceholder slot="tools-listing-top" format="banner" />

      {/* Tools Grid */}
      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-8">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 my-8 p-8">
          <p className="text-lg font-bold text-slate-900 dark:text-white">
            No tools found matching your criteria.
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Try adjusting your search query or selecting &quot;All Tools&quot;.
          </p>
          <button
            type="button"
            onClick={() => {
              setActiveCategory('all');
              setSearchQuery('');
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Ad Placement */}
      <AdPlaceholder slot="tools-listing-bottom" format="responsive" />
    </div>
  );
}
