'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'multizest-favorites';

export function useFavorites() {
  const [favoriteSlugs, setFavoriteSlugs] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setFavoriteSlugs(JSON.parse(stored));
      }
    } catch (_) {}
  }, []);

  const toggleFavorite = useCallback((slug: string) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      let list: string[] = stored ? JSON.parse(stored) : [];
      if (list.includes(slug)) {
        list = list.filter((s) => s !== slug);
      } else {
        list = [...list, slug];
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      setFavoriteSlugs(list);
    } catch (_) {}
  }, []);

  const isFavorite = useCallback(
    (slug: string) => favoriteSlugs.includes(slug),
    [favoriteSlugs]
  );

  return { favoriteSlugs, toggleFavorite, isFavorite };
}

