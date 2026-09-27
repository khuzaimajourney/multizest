'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, Check, X } from 'lucide-react';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: true,
    advertising: true,
  });

  useEffect(() => {
    const consent = localStorage.getItem('multizest-cookie-consent');
    if (!consent) {
      // Delay showing slightly for smooth entrance
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem(
      'multizest-cookie-consent',
      JSON.stringify({ necessary: true, analytics: true, advertising: true, timestamp: Date.now() })
    );
    setVisible(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem(
      'multizest-cookie-consent',
      JSON.stringify({ ...preferences, necessary: true, timestamp: Date.now() })
    );
    setVisible(false);
    setShowPreferences(false);
  };

  const handleDeclineOptional = () => {
    localStorage.setItem(
      'multizest-cookie-consent',
      JSON.stringify({ necessary: true, analytics: false, advertising: false, timestamp: Date.now() })
    );
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <aside
      aria-label="Cookie consent banner"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-500"
    >
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xl shadow-slate-900/10 text-slate-800 dark:text-slate-200 text-sm">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Privacy & Cookie Notice
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              We use strictly local browser processing for your files. We use minimal cookies to analyze site traffic, display relevant advertisements, and improve our free tools. Learn more in our{' '}
              <Link href="/privacy-policy" className="text-blue-600 dark:text-blue-400 underline hover:text-blue-700">
                Privacy Policy
              </Link>.
            </p>
          </div>
        </div>

        {showPreferences && (
          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Strictly Necessary</p>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">Core site functionality & local client-side tool sandboxing.</p>
              </div>
              <span className="text-[11px] font-medium text-slate-400">Always Active</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Analytics Cookies</p>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">Aggregated anonymous traffic analysis.</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.analytics}
                onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Advertising Cookies</p>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">Supports Google AdSense to keep tools 100% free.</p>
              </div>
              <input
                type="checkbox"
                checked={preferences.advertising}
                onChange={(e) => setPreferences({ ...preferences, advertising: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {!showPreferences ? (
            <>
              <button
                type="button"
                onClick={handleAcceptAll}
                className="flex-1 py-2 px-3 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm"
              >
                Accept All
              </button>
              <button
                type="button"
                onClick={() => setShowPreferences(true)}
                className="py-2 px-3 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
              >
                Preferences
              </button>
              <button
                type="button"
                onClick={handleDeclineOptional}
                className="py-2 px-2.5 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
              >
                Essential Only
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleSavePreferences}
                className="flex-1 py-2 px-3 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              >
                Save My Choices
              </button>
              <button
                type="button"
                onClick={() => setShowPreferences(false)}
                className="py-2 px-3 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
              >
                Back
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
