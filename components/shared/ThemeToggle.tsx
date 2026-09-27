'use client';

import React, { useSyncExternalStore, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

const emptySubscribe = () => () => {};

export default function ThemeToggle() {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    const stored = localStorage.getItem('multizest-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return stored === 'dark' || (!stored && prefersDark) ? 'dark' : 'light';
  });

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('multizest-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('multizest-theme', 'light');
    }
  };

  if (!isClient) {
    return (
      <div className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-800/50" />
    );
  }

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors border border-slate-200/80 dark:border-slate-700/80"
    >
      {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
    </button>
  );
}
