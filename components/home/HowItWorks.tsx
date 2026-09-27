import React from 'react';
import { MousePointerClick, UploadCloud, FileCheck } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      step: '01',
      title: 'Choose a Tool',
      description: 'Select the tool you need from our clean category catalog — PDF converters, image optimizers, text counters, or generators.',
      icon: <MousePointerClick className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
      color: 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-900',
    },
    {
      step: '02',
      title: 'Upload or Enter Data',
      description: 'Drag and drop your document, paste your draft, or enter configuration parameters. Processing starts immediately inside your browser.',
      icon: <UploadCloud className="w-6 h-6 text-violet-600 dark:text-violet-400" />,
      color: 'bg-violet-50 dark:bg-violet-950/60 border-violet-200 dark:border-violet-900',
    },
    {
      step: '03',
      title: 'Download Results Instantly',
      description: 'Preview the rendered output, check file metrics, and download your optimized files or vector assets without watermarks.',
      icon: <FileCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
      color: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-900',
    },
  ];

  return (
    <section className="py-14 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          How MultiZest Works
        </h2>
        <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400">
          No sign-ups, no waitlists, and no cloud processing queues. Instant execution in three simple steps.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
        {steps.map((item, index) => (
          <div
            key={item.step}
            className="relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-8 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className={`p-3.5 rounded-2xl border ${item.color}`}>
                  {item.icon}
                </div>
                <span className="text-3xl font-black text-slate-200 dark:text-slate-800">
                  {item.step}
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-xs font-semibold text-slate-400">
              Step {index + 1} of 3
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
