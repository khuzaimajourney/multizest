'use client';

import React, { useState } from 'react';
import {
  Link2,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { fireSuccessConfetti } from '@/lib/confetti';
import InteractiveTooltip from '@/components/shared/InteractiveTooltip';

export default function UtmBuilderTool() {
  const [websiteUrl, setWebsiteUrl] = useState('https://multizest.com');
  const [utmSource, setUtmSource] = useState('newsletter');
  const [utmMedium, setUtmMedium] = useState('email');
  const [utmCampaign, setUtmCampaign] = useState('spring_launch');
  const [utmTerm, setUtmTerm] = useState('');
  const [utmContent, setUtmContent] = useState('header_cta');
  const [copied, setCopied] = useState(false);

  // Auto construct clean URL
  const buildUtmUrl = () => {
    if (!websiteUrl) return '';

    try {
      // Ensure URL has protocol
      let base = websiteUrl.trim();
      if (!base.startsWith('http://') && !base.startsWith('https://')) {
        base = `https://${base}`;
      }

      const urlObj = new URL(base);

      if (utmSource.trim()) {
        urlObj.searchParams.set('utm_source', utmSource.trim().toLowerCase().replace(/\s+/g, '_'));
      }
      if (utmMedium.trim()) {
        urlObj.searchParams.set('utm_medium', utmMedium.trim().toLowerCase().replace(/\s+/g, '_'));
      }
      if (utmCampaign.trim()) {
        urlObj.searchParams.set('utm_campaign', utmCampaign.trim().toLowerCase().replace(/\s+/g, '_'));
      }
      if (utmTerm.trim()) {
        urlObj.searchParams.set('utm_term', utmTerm.trim().toLowerCase().replace(/\s+/g, '_'));
      }
      if (utmContent.trim()) {
        urlObj.searchParams.set('utm_content', utmContent.trim().toLowerCase().replace(/\s+/g, '_'));
      }

      return urlObj.toString();
    } catch (e) {
      return '';
    }
  };

  const finalUrl = buildUtmUrl();

  const handleCopy = () => {
    if (!finalUrl) return;
    navigator.clipboard.writeText(finalUrl);
    setCopied(true);
    fireSuccessConfetti();
    setTimeout(() => setCopied(false), 2000);
  };

  const setPreset = (source: string, medium: string) => {
    setUtmSource(source);
    setUtmMedium(medium);
  };

  return (
    <div className="space-y-6">
      {/* Quick Presets */}
      <div className="flex flex-wrap items-center gap-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-xs">
        <span className="font-bold text-slate-500 dark:text-slate-400 flex items-center mr-1">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500 mr-1" />
          Quick Presets:
        </span>
        <button
          type="button"
          onClick={() => setPreset('google', 'cpc')}
          className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-indigo-50 font-medium"
        >
          Google Ads
        </button>
        <button
          type="button"
          onClick={() => setPreset('facebook', 'social')}
          className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-indigo-50 font-medium"
        >
          Facebook Post
        </button>
        <button
          type="button"
          onClick={() => setPreset('twitter', 'social')}
          className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-indigo-50 font-medium"
        >
          X / Twitter
        </button>
        <button
          type="button"
          onClick={() => setPreset('linkedin', 'social')}
          className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-indigo-50 font-medium"
        >
          LinkedIn
        </button>
        <button
          type="button"
          onClick={() => setPreset('newsletter', 'email')}
          className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-indigo-50 font-medium"
        >
          Email Newsletter
        </button>
      </div>

      {/* Main Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm">
        <div className="md:col-span-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
            Website URL (Destination) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="https://yourwebsite.com/product"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center mb-1">
            <span>Campaign Source (`utm_source`)</span>
            <InteractiveTooltip content="Where the traffic is coming from, e.g. google, newsletter, facebook." />
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="text"
            value={utmSource}
            onChange={(e) => setUtmSource(e.target.value)}
            placeholder="e.g. newsletter"
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center mb-1">
            <span>Campaign Medium (`utm_medium`)</span>
            <InteractiveTooltip content="Marketing channel, e.g. cpc, email, social, referral, banner." />
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="text"
            value={utmMedium}
            onChange={(e) => setUtmMedium(e.target.value)}
            placeholder="e.g. email"
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center mb-1">
            <span>Campaign Name (`utm_campaign`)</span>
            <InteractiveTooltip content="Specific product promotion or strategic campaign, e.g. summer_sale, v3_launch." />
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="text"
            value={utmCampaign}
            onChange={(e) => setUtmCampaign(e.target.value)}
            placeholder="e.g. v3_launch"
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center mb-1">
            <span>Campaign Content (`utm_content`)</span>
            <InteractiveTooltip content="Used for A/B testing different links or buttons pointing to the same URL." />
          </label>
          <input
            type="text"
            value={utmContent}
            onChange={(e) => setUtmContent(e.target.value)}
            placeholder="e.g. top_banner"
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white"
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center mb-1">
            <span>Campaign Term (`utm_term`) [Optional]</span>
            <InteractiveTooltip content="Used primarily in paid search to identify the targeted keyword." />
          </label>
          <input
            type="text"
            value={utmTerm}
            onChange={(e) => setUtmTerm(e.target.value)}
            placeholder="e.g. free online tools"
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Generated Output Card */}
      <div className="p-5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
            <Link2 className="w-4 h-4 text-indigo-600" />
            Generated Tracking URL
          </span>
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            Valid GA4 URL
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900 font-mono text-xs break-all text-slate-800 dark:text-slate-200 select-all">
          {finalUrl || 'Please enter a valid website URL above.'}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              setWebsiteUrl('');
              setUtmSource('');
              setUtmMedium('');
              setUtmCampaign('');
              setUtmTerm('');
              setUtmContent('');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Fields</span>
          </button>

          <div className="flex items-center gap-2">
            {finalUrl && (
              <a
                href={finalUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Test Link</span>
              </a>
            )}

            <button
              type="button"
              onClick={handleCopy}
              disabled={!finalUrl}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/25 active:scale-95 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied URL!' : 'Copy Tracking URL'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
