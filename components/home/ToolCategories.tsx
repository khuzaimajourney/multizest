import React from 'react';
import Link from 'next/link';
import {
  FileText,
  Image as ImageIcon,
  FileEdit,
  QrCode,
  ArrowRight,
  Volume2,
  Code,
  Calculator,
  Video,
  Globe,
  Sparkles,
} from 'lucide-react';
import { TOOL_CATEGORIES, TOOLS_DATA } from '@/lib/tools-data';

export default function ToolCategories() {
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'FileText':
        return <FileText className="w-6 h-6 text-blue-500" />;
      case 'Image':
        return <ImageIcon className="w-6 h-6 text-violet-500" />;
      case 'FileEdit':
        return <FileEdit className="w-6 h-6 text-amber-500" />;
      case 'QrCode':
        return <QrCode className="w-6 h-6 text-emerald-500" />;
      case 'Volume2':
        return <Volume2 className="w-6 h-6 text-cyan-500" />;
      case 'Code':
        return <Code className="w-6 h-6 text-sky-500" />;
      case 'Calculator':
        return <Calculator className="w-6 h-6 text-rose-500" />;
      case 'Video':
        return <Video className="w-6 h-6 text-fuchsia-500" />;
      case 'Globe':
        return <Globe className="w-6 h-6 text-indigo-500" />;
      default:
        return <Sparkles className="w-6 h-6 text-blue-500" />;
    }
  };

  return (
    <section className="py-14 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Browse Tools by Category
        </h2>
        <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400">
          Find purpose-built utilities tailored for PDF documents, visual media, writing, and digital generators.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {TOOL_CATEGORIES.map((cat) => {
          const count = TOOLS_DATA.filter((t) => t.category === cat.id).length;
          return (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 flex flex-col justify-between hover:shadow-xl hover:border-blue-500/40 dark:hover:border-blue-500/30 transition-all duration-300"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 group-hover:scale-110 transition-transform duration-300">
                    {getCategoryIcon(cat.iconName)}
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {count} {count === 1 ? 'Tool' : 'Tools'}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {cat.name}
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {cat.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                <span>View Category</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
