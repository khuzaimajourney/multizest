import React from 'react';
import Link from 'next/link';
import { Heart, ShieldCheck, Zap, Lock } from 'lucide-react';
import Logo from '../shared/Logo';
import { TOOLS_DATA } from '@/lib/tools-data';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const companyLinks = [
    { name: 'About Us', href: '/about' },
    { name: 'Contact Us', href: '/contact' },
    { name: 'Blog', href: '/blog' },
    { name: 'All Tools', href: '/tools' },
  ];

  const legalLinks = [
    { name: 'Privacy Policy', href: '/privacy-policy' },
    { name: 'Terms of Service', href: '/terms-of-service' },
    { name: 'Disclaimer', href: '/disclaimer' },
    { name: 'DMCA Policy', href: '/dmca' },
  ];

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 transition-colors">
      {/* Trust banner */}
      <div className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-around gap-4 text-xs font-medium text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-500" />
            <span>100% Client-Side Processing</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-500" />
            <span>Zero Data Storage or Tracking</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Instant In-Browser Execution</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand & mission */}
          <div className="lg:col-span-2 space-y-4">
            <Logo />
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed">
              MultiZest provides fast, private, browser-based utilities for creators, students, and professionals. Free forever, no sign-ups, and zero files uploaded to servers.
            </p>
            <div className="pt-2 text-xs text-slate-500 dark:text-slate-400">
              Designed with strict adherence to privacy-first web standards and Google AdSense publisher policies.
            </div>
          </div>

          {/* Tools column */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              Online Tools
            </h3>
            <ul className="space-y-2.5 text-sm">
              {TOOLS_DATA.map((tool) => (
                <li key={tool.id}>
                  <Link
                    href={`/tools/${tool.slug}`}
                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company column */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              Company
            </h3>
            <ul className="space-y-2.5 text-sm">
              {companyLinks.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal column */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              Legal & Compliance
            </h3>
            <ul className="space-y-2.5 text-sm">
              {legalLinks.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>© {currentYear} MultiZest. All rights reserved.</p>
          <p className="flex items-center gap-1">
            <span>Built with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            <span>for a faster, more private internet.</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
