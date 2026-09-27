import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import JsonLd from '../shared/JsonLd';
import { generateBreadcrumbSchema } from '@/lib/seo-config';

export interface BreadcrumbItem {
  name: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  const allItems = [{ name: 'Home', href: '/' }, ...items];

  const schemaItems = allItems.map((item) => ({
    name: item.name,
    item: item.href,
  }));

  return (
    <>
      <JsonLd data={generateBreadcrumbSchema(schemaItems)} />
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          {allItems.map((item, index) => {
            const isLast = index === allItems.length - 1;
            return (
              <li key={item.href} className="inline-flex items-center gap-1.5">
                {index > 0 && (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                )}
                {isLast ? (
                  <span
                    aria-current="page"
                    className="font-semibold text-slate-900 dark:text-white line-clamp-1 max-w-[200px] sm:max-w-none"
                  >
                    {item.name}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-flex items-center gap-1"
                  >
                    {index === 0 && <Home className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
                    <span>{item.name}</span>
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
