'use client';

import React from 'react';
import Link from 'next/link';
import {
  FileText,
  Files,
  FileArchive,
  Minimize2,
  Maximize2,
  RefreshCw,
  Crop,
  FileEdit,
  Type,
  AlignLeft,
  Volume2,
  QrCode,
  Shield,
  Palette,
  Braces,
  Binary,
  FileCode,
  Calendar,
  Percent,
  Activity,
  ArrowRight,
  Sparkles,
  Heart,
  Star,
  Scissors,
  RotateCw,
  Stamp,
  Music,
  FileImage,
  Code2,
  Link2,
  Table,
  GitCompare,
} from 'lucide-react';
import { ToolItem } from '@/lib/types';
import { useFavorites } from '@/hooks/useFavorites';
import { getToolHref } from '@/lib/tools-data';

interface ToolCardProps {
  tool: ToolItem;
  viewMode?: 'grid' | 'list';
}

export default function ToolCard({ tool, viewMode = 'grid' }: ToolCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(tool.slug);
  const toolHref = getToolHref(tool);

  const getBadgeStyle = (badge?: string) => {
    if (!badge) return '';
    if (badge.includes('AI')) {
      return 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm';
    }
    if (badge === 'New') {
      return 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-sm';
    }
    if (badge === 'WASM') {
      return 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300';
    }
    return 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300';
  };

  const getToolIcon = (iconName: string) => {
    switch (iconName) {
      // PDF
      case 'FileText':
        return <FileText className="w-5 h-5 text-blue-500" />;
      case 'Files':
        return <Files className="w-5 h-5 text-blue-600" />;
      case 'FileArchive':
        return <FileArchive className="w-5 h-5 text-indigo-500" />;

      // Image
      case 'Minimize2':
        return <Minimize2 className="w-5 h-5 text-violet-500" />;
      case 'Maximize2':
        return <Maximize2 className="w-5 h-5 text-purple-500" />;
      case 'RefreshCw':
        return <RefreshCw className="w-5 h-5 text-violet-600" />;
      case 'Crop':
        return <Crop className="w-5 h-5 text-fuchsia-500" />;

      // Text
      case 'FileEdit':
        return <FileEdit className="w-5 h-5 text-amber-500" />;
      case 'Type':
        return <Type className="w-5 h-5 text-orange-500" />;
      case 'AlignLeft':
        return <AlignLeft className="w-5 h-5 text-amber-600" />;
      case 'Volume2':
        return <Volume2 className="w-5 h-5 text-yellow-500" />;

      // Generator
      case 'QrCode':
        return <QrCode className="w-5 h-5 text-emerald-500" />;
      case 'Shield':
        return <Shield className="w-5 h-5 text-teal-500" />;
      case 'Palette':
        return <Palette className="w-5 h-5 text-emerald-600" />;

      // Developer
      case 'Braces':
        return <Braces className="w-5 h-5 text-cyan-500" />;
      case 'Binary':
        return <Binary className="w-5 h-5 text-blue-500" />;
      case 'FileCode':
        return <FileCode className="w-5 h-5 text-sky-500" />;

      // Calculator
      case 'Calendar':
        return <Calendar className="w-5 h-5 text-rose-500" />;
      case 'Percent':
        return <Percent className="w-5 h-5 text-pink-500" />;
      case 'Activity':
        return <Activity className="w-5 h-5 text-red-500" />;

      // New V3 Tools
      case 'Scissors':
        return <Scissors className="w-5 h-5 text-indigo-500" />;
      case 'RotateCw':
        return <RotateCw className="w-5 h-5 text-blue-500" />;
      case 'Stamp':
        return <Stamp className="w-5 h-5 text-violet-500" />;
      case 'Music':
        return <Music className="w-5 h-5 text-fuchsia-500" />;
      case 'FileImage':
        return <FileImage className="w-5 h-5 text-pink-500" />;
      case 'Code2':
        return <Code2 className="w-5 h-5 text-sky-500" />;
      case 'Link2':
        return <Link2 className="w-5 h-5 text-indigo-500" />;
      case 'Table':
        return <Table className="w-5 h-5 text-teal-500" />;
      case 'GitCompare':
        return <GitCompare className="w-5 h-5 text-amber-500" />;

      default:
        return <Sparkles className="w-5 h-5 text-blue-500" />;
    }
  };

  if (viewMode === 'list') {
    return (
      <div className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm hover:shadow-md hover:border-blue-500/40 transition-all duration-200">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:scale-105 transition-transform shrink-0">
            {getToolIcon(tool.iconName)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Link
                href={toolHref}
                className="font-bold text-base text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
              >
                {tool.name}
              </Link>
              {tool.badge && (
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${getBadgeStyle(tool.badge)}`}>
                  {tool.badge}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5 max-w-xl">
              {tool.shortDescription}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              toggleFavorite(tool.slug);
            }}
            aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
            className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
          >
            <Heart className={`w-4 h-4 ${favorited ? 'text-red-500 fill-red-500' : ''}`} />
          </button>
          <Link
            href={toolHref}
            className="px-3.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white text-xs font-semibold inline-flex items-center gap-1 transition-all"
          >
            <span>Use Free</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 flex flex-col justify-between shadow-sm hover:shadow-xl hover:border-blue-500/40 dark:hover:border-blue-500/30 transition-all duration-300">
      <div>
        {/* Header with icon, category badge, and favorite heart */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 group-hover:scale-110 transition-transform duration-300">
            {getToolIcon(tool.iconName)}
          </div>
          <div className="flex items-center gap-2">
            {tool.badge && (
              <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${getBadgeStyle(tool.badge)}`}>
                {tool.badge}
              </span>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                toggleFavorite(tool.slug);
              }}
              aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
              className="p-1.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
            >
              <Heart className={`w-4 h-4 ${favorited ? 'text-red-500 fill-red-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Name and description */}
        <div className="mb-2">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 block mb-1">
            {tool.categoryName}
          </span>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            <Link href={toolHref}>{tool.name}</Link>
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {tool.shortDescription}
        </p>

        {/* Rating Stars */}
        <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center text-amber-400">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
          </div>
          <span className="font-bold text-slate-700 dark:text-slate-300 font-mono">
            {tool.rating || 4.9}
          </span>
          <span className="text-[11px] text-slate-400">
            ({tool.ratingCount || 200}+)
          </span>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          100% Client-Side
        </span>
        <Link
          href={toolHref}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-all"
        >
          <span>Use Free</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
