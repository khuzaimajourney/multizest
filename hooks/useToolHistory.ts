'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'multizest-recent-tools';

export function useToolHistory() {
  const [recentSlugs, setRecentSlugs] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setRecentSlugs(JSON.parse(stored));
      }
    } catch (_) {}
  }, []);

  const addRecentTool = useCallback((slug: string) => {
    if (!slug) return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      let list: string[] = stored ? JSON.parse(stored) : [];
      // If already at the head of recent tools, avoid redundant storage writes and re-renders
      if (list[0] === slug) {
        return;
      }
      list = [slug, ...list.filter((s) => s !== slug)].slice(0, 5);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      setRecentSlugs(list);
    } catch (_) {}
  }, []);

  const clearHistory = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setRecentSlugs([]);
    } catch (_) {}
  }, []);

  return { recentSlugs, addRecentTool, clearHistory };
}

