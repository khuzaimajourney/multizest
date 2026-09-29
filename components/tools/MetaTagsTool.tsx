'use client';

import React, { useState } from 'react';
import {
  Copy,
  Check,
  Globe,
  Share2,
  Code2,
  Sparkles,
} from 'lucide-react';
import InteractiveTooltip from '@/components/shared/InteractiveTooltip';

export default function MetaTagsTool() {
  const [title, setTitle] = useState('MultiZest — Free Online Toolbox');
  const [description, setDescription] = useState(
    'Fast, private, and free browser-based tools to compress images, convert PDFs, and generate QR codes with zero server uploads.'
  );
  const [url, setUrl] = useState('https://multizest.vercel.app');
  const [imageUrl, setImageUrl] = useState('https://multizest.vercel.app/api/og');
  const [siteName, setSiteName] = useState('MultiZest');
  const [twitterHandle, setTwitterHandle] = useState('@multizest');
  const [previewTab, setPreviewTab] = useState<'google' | 'twitter' | 'facebook'>('google');
  const [copied, setCopied] = useState(false);

  // Generate the HTML code
  const generatedHtml = `<!-- Primary Meta Tags -->
<title>${title}</title>
<meta name="title" content="${title}" />
<meta name="description" content="${description}" />
<link rel="canonical" href="${url}" />

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website" />
<meta property="og:url" content="${url}" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
<meta property="og:image" content="${imageUrl}" />
<meta property="og:site_name" content="${siteName}" />

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image" />
<meta property="twitter:url" content="${url}" />
<meta property="twitter:title" content="${title}" />
<meta property="twitter:description" content="${description}" />
<meta property="twitter:image" content="${imageUrl}" />
${twitterHandle ? `<meta name="twitter:creator" content="${twitterHandle}" />` : ''}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Inputs */}
        <div className="space-y-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center">
                <span>Page Title</span>
                <InteractiveTooltip content="Ideal length is 50-60 characters for optimal display in search results." />
              </label>
              <span
                className={`text-[11px] font-mono font-bold ${
                  title.length > 60 ? 'text-amber-500' : 'text-slate-400'
                }`}
              >
                {title.length}/60
              </span>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. My Website — Awesome Platform"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center">
                <span>Meta Description</span>
                <InteractiveTooltip content="Summarize the page content. Keep between 120-160 characters for Google snippets." />
              </label>
              <span
                className={`text-[11px] font-mono font-bold ${
                  description.length > 160 ? 'text-amber-500' : 'text-slate-400'
                }`}
              >
                {description.length}/160
              </span>
            </div>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter a compelling description that invites clicks..."
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Canonical URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/page"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                OG Image URL
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/og.jpg"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Site Name
              </label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                placeholder="Brand Name"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Twitter Handle
              </label>
              <input
                type="text"
                value={twitterHandle}
                onChange={(e) => setTwitterHandle(e.target.value)}
                placeholder="@username"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Live Social Previews */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <button
              type="button"
              onClick={() => setPreviewTab('google')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                previewTab === 'google'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Google Search
            </button>
            <button
              type="button"
              onClick={() => setPreviewTab('twitter')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                previewTab === 'twitter'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              X (Twitter) Card
            </button>
            <button
              type="button"
              onClick={() => setPreviewTab('facebook')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                previewTab === 'facebook'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Facebook / LinkedIn
            </button>
          </div>

          {/* Google Preview */}
          {previewTab === 'google' && (
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1.5 font-sans">
              <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-bold">
                  Z
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-xs leading-none">{siteName}</span>
                  <span className="text-[11px] text-slate-500 truncate max-w-xs">{url}</span>
                </div>
              </div>
              <h4 className="text-blue-700 dark:text-blue-400 hover:underline cursor-pointer font-medium text-lg leading-snug">
                {title}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {description}
              </p>
            </div>
          )}

          {/* Twitter Card Preview */}
          {previewTab === 'twitter' && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 shadow-sm max-w-md">
              <div className="h-44 bg-gradient-to-tr from-sky-600 to-indigo-700 flex items-center justify-center text-white font-bold p-4 text-center">
                <span>{imageUrl.startsWith('http') ? 'Social Card Image Preview' : 'No Image Provided'}</span>
              </div>
              <div className="p-3.5 space-y-1">
                <span className="text-[11px] text-slate-400 lowercase">{url.replace(/https?:\/\//, '')}</span>
                <h5 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">{title}</h5>
                <p className="text-xs text-slate-500 line-clamp-2">{description}</p>
              </div>
            </div>
          )}

          {/* Facebook Preview */}
          {previewTab === 'facebook' && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 shadow-sm max-w-md">
              <div className="h-44 bg-gradient-to-tr from-blue-700 to-indigo-800 flex items-center justify-center text-white font-bold p-4 text-center">
                <span>OpenGraph Card Banner</span>
              </div>
              <div className="p-3.5 space-y-1 bg-slate-50 dark:bg-slate-800/50">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  {url.replace(/https?:\/\//, '').split('/')[0]}
                </span>
                <h5 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">{title}</h5>
                <p className="text-xs text-slate-500 line-clamp-2">{description}</p>
              </div>
            </div>
          )}

          {/* Code Output Box */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-900 p-4 text-slate-200 text-xs font-mono relative">
            <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-800">
              <span className="text-slate-400 font-bold flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-sky-400" />
                HTML Meta Code
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-sans text-xs font-bold transition-colors"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>
            <pre className="max-h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed">
              {generatedHtml}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
