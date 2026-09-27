'use client';

import React, { useState } from 'react';
import { Percent, ArrowRight, HelpCircle } from 'lucide-react';

export default function PercentageCalculatorTool() {
  const [tab, setTab] = useState<'percentOf' | 'whatPercent' | 'change' | 'increase' | 'decrease'>('percentOf');

  // Mode 1: What is X% of Y?
  const [m1X, setM1X] = useState<number>(20);
  const [m1Y, setM1Y] = useState<number>(150);

  // Mode 2: X is what % of Y?
  const [m2X, setM2X] = useState<number>(30);
  const [m2Y, setM2Y] = useState<number>(120);

  // Mode 3: Percentage Change from X to Y
  const [m3X, setM3X] = useState<number>(80);
  const [m3Y, setM3Y] = useState<number>(100);

  // Mode 4: Percentage Increase: X + Y%
  const [m4X, setM4X] = useState<number>(100);
  const [m4Y, setM4Y] = useState<number>(15);

  // Mode 5: Percentage Decrease: X - Y%
  const [m5X, setM5X] = useState<number>(100);
  const [m5Y, setM5Y] = useState<number>(20);

  return (
    <div className="space-y-6">
      {/* Mode Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
        {[
          { id: 'percentOf', label: 'What is X% of Y?' },
          { id: 'whatPercent', label: 'X is what % of Y?' },
          { id: 'change', label: '% Change (From X to Y)' },
          { id: 'increase', label: '% Increase (X + Y%)' },
          { id: 'decrease', label: '% Decrease (Discount)' },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id as typeof tab)}
            className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl text-xs font-semibold text-center transition-all ${
              tab === item.id
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Tab 1: What is X% of Y? */}
      {tab === 'percentOf' && (
        <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-6">
          <div className="flex flex-wrap items-center gap-3 text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200">
            <span>What is</span>
            <input
              type="number"
              value={m1X}
              onChange={(e) => setM1X(Number(e.target.value))}
              className="w-24 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono text-center"
            />
            <span>% of</span>
            <input
              type="number"
              value={m1Y}
              onChange={(e) => setM1Y(Number(e.target.value))}
              className="w-28 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono text-center"
            />
            <span>?</span>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-xs uppercase font-bold text-slate-400">Calculated Result</span>
            <div className="text-4xl font-black text-blue-600 font-mono">
              {((m1X / 100) * m1Y).toLocaleString(undefined, { maximumFractionDigits: 4 })}
            </div>
            <p className="text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800 font-mono">
              Formula: ({m1X} ÷ 100) × {m1Y} = {((m1X / 100) * m1Y).toFixed(2)}
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: X is what % of Y? */}
      {tab === 'whatPercent' && (
        <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-6">
          <div className="flex flex-wrap items-center gap-3 text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200">
            <input
              type="number"
              value={m2X}
              onChange={(e) => setM2X(Number(e.target.value))}
              className="w-28 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono text-center"
            />
            <span>is what % of</span>
            <input
              type="number"
              value={m2Y}
              onChange={(e) => setM2Y(Number(e.target.value))}
              className="w-28 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono text-center"
            />
            <span>?</span>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-xs uppercase font-bold text-slate-400">Calculated Percentage</span>
            <div className="text-4xl font-black text-purple-600 font-mono">
              {m2Y !== 0
                ? `${((m2X / m2Y) * 100).toLocaleString(undefined, { maximumFractionDigits: 2 })}%`
                : 'Undefined (division by zero)'}
            </div>
            <p className="text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800 font-mono">
              Formula: ({m2X} ÷ {m2Y}) × 100 = {m2Y !== 0 ? ((m2X / m2Y) * 100).toFixed(2) : 0}%
            </p>
          </div>
        </div>
      )}

      {/* Tab 3: % Change */}
      {tab === 'change' && (
        <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-6">
          <div className="flex flex-wrap items-center gap-3 text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200">
            <span>What is the percentage change from</span>
            <input
              type="number"
              value={m3X}
              onChange={(e) => setM3X(Number(e.target.value))}
              className="w-28 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono text-center"
            />
            <span>to</span>
            <input
              type="number"
              value={m3Y}
              onChange={(e) => setM3Y(Number(e.target.value))}
              className="w-28 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono text-center"
            />
            <span>?</span>
          </div>

          {(() => {
            const diff = m3Y - m3X;
            const pct = m3X !== 0 ? (diff / m3X) * 100 : 0;
            const isIncrease = pct >= 0;

            return (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-xs uppercase font-bold text-slate-400">Shift</span>
                <div
                  className={`text-4xl font-black font-mono ${
                    isIncrease ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {isIncrease ? '+' : ''}
                  {pct.toFixed(2)}% ({isIncrease ? 'Increase' : 'Decrease'})
                </div>
                <p className="text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800 font-mono">
                  Formula: (({m3Y} - {m3X}) ÷ {m3X}) × 100 = {pct.toFixed(2)}%
                </p>
              </div>
            );
          })()}
        </div>
      )}

      {/* Tab 4: Increase */}
      {tab === 'increase' && (
        <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-6">
          <div className="flex flex-wrap items-center gap-3 text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200">
            <span>Increase</span>
            <input
              type="number"
              value={m4X}
              onChange={(e) => setM4X(Number(e.target.value))}
              className="w-28 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono text-center"
            />
            <span>by</span>
            <input
              type="number"
              value={m4Y}
              onChange={(e) => setM4Y(Number(e.target.value))}
              className="w-24 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono text-center"
            />
            <span>%</span>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-xs uppercase font-bold text-slate-400">Final Increased Value</span>
            <div className="text-4xl font-black text-emerald-600 font-mono">
              {(m4X * (1 + m4Y / 100)).toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800 font-mono">
              Amount added: +{((m4X * m4Y) / 100).toFixed(2)} (Formula: {m4X} × (1 + {m4Y}/100))
            </p>
          </div>
        </div>
      )}

      {/* Tab 5: Decrease (Discount) */}
      {tab === 'decrease' && (
        <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-6">
          <div className="flex flex-wrap items-center gap-3 text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200">
            <span>Discount / Decrease</span>
            <input
              type="number"
              value={m5X}
              onChange={(e) => setM5X(Number(e.target.value))}
              className="w-28 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono text-center"
            />
            <span>by</span>
            <input
              type="number"
              value={m5Y}
              onChange={(e) => setM5Y(Number(e.target.value))}
              className="w-24 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-mono text-center"
            />
            <span>%</span>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-xs uppercase font-bold text-slate-400">Discounted Final Price</span>
            <div className="text-4xl font-black text-blue-600 font-mono">
              {(m5X * (1 - m5Y / 100)).toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800 font-mono">
              You save: -{((m5X * m5Y) / 100).toFixed(2)} (Formula: {m5X} × (1 - {m5Y}/100))
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
