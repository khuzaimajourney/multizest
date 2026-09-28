'use client';

import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface InteractiveTooltipProps {
  content: string;
}

export default function InteractiveTooltip({ content }: InteractiveTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <span className="relative inline-flex items-center ml-1 align-middle">
      <button
        type="button"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="More information"
        className="p-0.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-full focus:outline-none"
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>

      {isOpen && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 sm:w-60 p-2.5 bg-slate-900 text-white text-xs rounded-xl shadow-xl z-50 pointer-events-none text-center font-normal leading-snug animate-in fade-in zoom-in-95 duration-150 border border-slate-700">
          {content}
          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900" />
        </span>
      )}
    </span>
  );
}
