import React from 'react';
import Link from 'next/link';
import { Search, Home, FileText, Minimize2, QrCode } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
      <div className="w-20 h-20 rounded-3xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center font-black text-3xl shadow-sm mb-6 border border-blue-200/60 dark:border-blue-900/40">
        404
      </div>

      <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
        Oops! Page Not Found
      </h1>
      <p className="mt-3 text-base text-slate-600 dark:text-slate-400 max-w-md mx-auto">
        The tool or page you are looking for may have been moved, renamed, or is currently unavailable.
      </p>

      {/* Quick Search */}
      <div className="max-w-md mx-auto my-8">
        <form
          action="/tools"
          method="GET"
          className="relative flex items-center shadow-sm rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
        >
          <Search className="w-5 h-5 text-slate-400 ml-4 shrink-0" />
          <input
            type="text"
            name="q"
            placeholder="Search for a tool..."
            className="w-full py-3 pl-3 pr-4 text-sm bg-transparent text-slate-900 dark:text-white focus:outline-none"
          />
          <button
            type="submit"
            className="mr-2 px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold"
          >
            Find
          </button>
        </form>
      </div>

      {/* Popular Tools Shortcuts */}
      <div className="border-t border-slate-200 dark:border-slate-800 pt-8 mt-8">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
          Popular Tools You Might Need
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/tools/pdf-to-image"
            className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 text-xs font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center gap-2 shadow-sm"
          >
            <FileText className="w-4 h-4 text-blue-500" />
            <span>PDF to Image</span>
          </Link>
          <Link
            href="/tools/image-compressor"
            className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 text-xs font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center gap-2 shadow-sm"
          >
            <Minimize2 className="w-4 h-4 text-violet-500" />
            <span>Image Compressor</span>
          </Link>
          <Link
            href="/tools/qr-code-generator"
            className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 text-xs font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center gap-2 shadow-sm"
          >
            <QrCode className="w-4 h-4 text-emerald-500" />
            <span>QR Code Generator</span>
          </Link>
        </div>
      </div>

      {/* Return to Home CTA */}
      <div className="mt-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-semibold text-sm shadow-md transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Back to Homepage</span>
        </Link>
      </div>
    </div>
  );
}
