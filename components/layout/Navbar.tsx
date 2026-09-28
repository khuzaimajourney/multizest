'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronDown,
  Menu,
  X,
  FileText,
  Image as ImageIcon,
  Minimize2,
  Maximize2,
  FileEdit,
  QrCode,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import Logo from '../shared/Logo';
import ThemeToggle from '../shared/ThemeToggle';
import { TOOL_CATEGORIES, TOOLS_DATA } from '@/lib/tools-data';

export default function Navbar() {
  const pathname = usePathname();
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const closeMenus = () => {
    setIsToolsOpen(false);
    setIsMobileMenuOpen(false);
  };

  // Track scroll position for subtle blur and shadow
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle outside clicks for desktop dropdown
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsToolsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const getToolIcon = (iconName: string) => {
    switch (iconName) {
      case 'FileText':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'Minimize2':
        return <Minimize2 className="w-4 h-4 text-violet-500" />;
      case 'Maximize2':
        return <Maximize2 className="w-4 h-4 text-purple-500" />;
      case 'FileEdit':
        return <FileEdit className="w-4 h-4 text-amber-500" />;
      case 'QrCode':
        return <QrCode className="w-4 h-4 text-emerald-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-blue-500" />;
    }
  };

  const navLinks = [
    { name: 'Blog', href: '/blog' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-200 border-b ${
        isScrolled
          ? 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-slate-200/80 dark:border-slate-800 shadow-sm'
          : 'bg-white dark:bg-slate-900 border-slate-200/50 dark:border-slate-800/80'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between">
        {/* Brand Logo */}
        <Logo isScrolled={isScrolled} />

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {/* Tools Mega Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsToolsOpen(!isToolsOpen)}
              onMouseEnter={() => setIsToolsOpen(true)}
              className={`px-3.5 py-2 rounded-xl text-sm font-medium inline-flex items-center gap-1.5 transition-colors ${
                isToolsOpen || pathname.startsWith('/tools')
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/40'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/50'
              }`}
              aria-expanded={isToolsOpen}
              aria-haspopup="true"
            >
              <span>Tools</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  isToolsOpen ? 'rotate-180 text-blue-600' : 'text-slate-400'
                }`}
              />
            </button>

            {/* Mega Menu Dropdown Card */}
            {isToolsOpen && (
              <div
                onMouseLeave={() => setIsToolsOpen(false)}
                className="absolute left-0 mt-2 w-[720px] max-h-[550px] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-5 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
              >
                <div className="grid grid-cols-3 gap-4">
                  {TOOL_CATEGORIES.map((cat) => {
                    const categoryTools = TOOLS_DATA.filter((t) => t.category === cat.id);
                    return (
                      <div key={cat.id} className="space-y-2">
                        <Link
                          href={`/categories/${cat.slug}`}
                          className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 inline-flex items-center gap-1.5 group"
                        >
                          <span>{cat.name}</span>
                          <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                        <div className="space-y-1">
                          {categoryTools.map((tool) => (
                            <Link
                              key={tool.id}
                              href={`/tools/${tool.slug}`}
                              className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100/90 dark:hover:bg-slate-800/80 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
                            >
                              <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:scale-105 transition-transform">
                                {getToolIcon(tool.iconName)}
                              </div>
                              <span className="truncate">{tool.name}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">
                    100% Client-Side & Free Forever
                  </span>
                  <Link
                    href="/tools"
                    className="font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                  >
                    <span>View All 31 Tools</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Standard Navigation Links */}
          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/40'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/50'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Icons & Mobile Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />

          <Link
            href="/tools"
            className="hidden sm:inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 active:scale-98 transition-all"
          >
            <span>Explore All Tools</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="md:hidden p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-Down Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top-4 duration-200">
          <div className="space-y-1">
            <div className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-400">
              Tool Categories
            </div>
            {TOOL_CATEGORIES.map((cat) => {
              const catTools = TOOLS_DATA.filter((t) => t.category === cat.id);
              return (
                <div key={cat.id} className="py-1">
                  <div className="px-3 py-1 font-semibold text-xs text-slate-700 dark:text-slate-300">
                    {cat.name}
                  </div>
                  <div className="pl-3 space-y-1">
                    {catTools.map((t) => (
                      <Link
                        key={t.id}
                        href={`/tools/${t.slug}`}
                        onClick={closeMenus}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        {getToolIcon(t.iconName)}
                        <span>{t.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-1">
            <Link
              href="/tools"
              onClick={closeMenus}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/30"
            >
              All Tools Overview →
            </Link>
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={closeMenus}
                className="block px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
