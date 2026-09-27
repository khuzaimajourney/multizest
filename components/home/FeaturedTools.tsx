import React from 'react';
import Link from 'next/link';
import { ArrowRight, Flame } from 'lucide-react';
import ToolCard from '../tools/ToolCard';
import { TOOLS_DATA } from '@/lib/tools-data';

export default function FeaturedTools() {
  return (
    <section className="py-14 sm:py-20 bg-slate-100/50 dark:bg-slate-900/40 border-y border-slate-200/60 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-2">
              <Flame className="w-4 h-4" />
              <span>Recommended by Creators</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Most Popular Tools
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Access the high-performance browser tools used daily by tens of thousands of users.
            </p>
          </div>

          <Link
            href="/tools"
            className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            <span>View All Tools</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TOOLS_DATA.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </div>
    </section>
  );
}
