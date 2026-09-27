import React from 'react';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  isScrolled?: boolean;
}

export default function Logo({ className = '' }: LogoProps) {
  return (
    <Link href="/" className={`inline-flex items-center gap-2.5 group select-none ${className}`}>
      <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
        {/* Stylized Z Spark */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 text-white drop-shadow-sm"
        >
          <path d="M4 4h14l-11 12h13" />
        </svg>
        {/* Sparkle accent */}
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full border-2 border-white dark:border-slate-900 animate-pulse" />
      </div>

      <div className="flex flex-col">
        <div className="flex items-center tracking-tight text-xl font-black">
          <span className="text-slate-900 dark:text-white">Multi</span>
          <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-amber-500 bg-clip-text text-transparent">
            Zest
          </span>
        </div>
        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-400 -mt-1 hidden sm:block">
          Fast • Free • Toolbox
        </span>
      </div>
    </Link>
  );
}
