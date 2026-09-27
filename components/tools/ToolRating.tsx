'use client';

import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';

interface ToolRatingProps {
  toolSlug: string;
  initialRating?: number;
  initialCount?: number;
}

export default function ToolRating({
  toolSlug,
  initialRating = 4.9,
  initialCount = 250,
}: ToolRatingProps) {
  const [userRating, setUserRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(`multizest-rating-${toolSlug}`);
      if (stored) {
        setUserRating(Number(stored));
        setSubmitted(true);
      }
    } catch (_) {}
  }, [toolSlug]);

  const handleRate = (stars: number) => {
    setUserRating(stars);
    setSubmitted(true);
    try {
      localStorage.setItem(`multizest-rating-${toolSlug}`, String(stars));
    } catch (_) {}
  };

  const currentDisplay = hoverRating || userRating || initialRating;

  return (
    <div className="inline-flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-xs">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleRate(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(null)}
            aria-label={`Rate ${star} stars`}
            className="p-0.5 text-slate-300 dark:text-slate-600 hover:scale-110 transition-transform focus:outline-none"
          >
            <Star
              className={`w-4 h-4 transition-colors ${
                star <= Math.round(currentDisplay)
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-slate-300 dark:text-slate-600'
              }`}
            />
          </button>
        ))}
      </div>
      <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
        {userRating ? `${userRating}.0` : initialRating.toFixed(1)}
      </span>
      <span className="text-slate-400 text-[11px]">
        ({submitted ? (initialCount + 1).toLocaleString() : initialCount.toLocaleString()})
      </span>
    </div>
  );
}
