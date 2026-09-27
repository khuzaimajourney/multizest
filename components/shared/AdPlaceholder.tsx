'use client';

import React from 'react';

interface AdPlaceholderProps {
  slot: string;
  className?: string;
  format?: 'banner' | 'responsive' | 'rectangle' | 'leaderboard';
}

export default function AdPlaceholder({
  slot,
  className = '',
  format = 'responsive',
}: AdPlaceholderProps) {
  // Configured dimensions based on slot format
  const formatClasses = {
    banner: 'min-h-[50px] sm:min-h-[90px] max-w-[728px] mx-auto',
    leaderboard: 'min-h-[90px] max-w-[728px] mx-auto',
    rectangle: 'min-h-[250px] w-full max-w-[300px] mx-auto',
    responsive: 'min-h-[90px] w-full',
  }[format];

  return (
    <div
      role="complementary"
      aria-label="Advertisement placeholder"
      className={`relative my-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 flex flex-col items-center justify-center p-3 text-center transition-colors group overflow-hidden ${formatClasses} ${className}`}
    >
      <div className="flex items-center gap-2">
        <span className="text-[10px] tracking-wider uppercase font-semibold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
          Advertisement
        </span>
        <span className="text-xs text-slate-400 dark:text-slate-400 font-mono">
          {slot}
        </span>
      </div>
      <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-1 max-w-xs">
        Google AdSense placement zone ready for script injection
      </p>
    </div>
  );
}
