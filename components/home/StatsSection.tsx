import React from 'react';
import { ShieldCheck, Smartphone, CheckCircle, Zap } from 'lucide-react';

export default function StatsSection() {
  const stats = [
    { value: '30+', label: 'Free Online Tools', sublabel: 'Client-side privacy' },
    { value: '100%', label: 'Browser-Based', sublabel: 'Local execution' },
    { value: '0', label: 'Sign-Ups Required', sublabel: 'Start instantly' },
    { value: '< 1s', label: 'Processing Speed', sublabel: 'Zero queue delay' },
  ];

  const trustPoints = [
    {
      icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />,
      title: 'Private & Secure by Architecture',
      description: 'Your photos, PDFs, and written text never leave your device. All computations execute exclusively in your browser sandbox.',
    },
    {
      icon: <Smartphone className="w-5 h-5 text-blue-500" />,
      title: 'Works Seamlessly on Any Device',
      description: 'Fully responsive for Mac, Windows, Linux, iOS, and Android. No software downloads or extensions necessary.',
    },
    {
      icon: <CheckCircle className="w-5 h-5 text-violet-500" />,
      title: 'Completely Free, No Paywalls',
      description: 'No subscription tiers, no credit card prompts, and no watermarks placed on your converted files or images.',
    },
  ];

  return (
    <section className="py-14 sm:py-20 bg-slate-900 text-white rounded-3xl mx-4 sm:mx-6 lg:mx-8 my-6 relative overflow-hidden">
      {/* Background glow decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-blue-400 text-xs font-semibold mb-3">
            <Zap className="w-3.5 h-3.5" />
            <span>Built for Modern Workflow</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
            Why 1,000+ Users Trust MultiZest Daily
          </h2>
          <p className="mt-3 text-slate-400 text-sm sm:text-base">
            We built MultiZest because basic digital tasks should not require paid software, spammy pop-ups, or handing your private files to unknown cloud servers.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center border-y border-slate-800 py-10 mb-12">
          {stats.map((item) => (
            <div key={item.label} className="p-2">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300 bg-clip-text text-transparent">
                {item.value}
              </div>
              <div className="mt-2 text-sm sm:text-base font-bold text-slate-200">
                {item.label}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">{item.sublabel}</div>
            </div>
          ))}
        </div>

        {/* Trust Points */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {trustPoints.map((point) => (
            <div
              key={point.title}
              className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700/60 flex flex-col justify-between"
            >
              <div>
                <div className="p-2.5 rounded-xl bg-slate-900 w-fit mb-4 border border-slate-700">
                  {point.icon}
                </div>
                <h3 className="font-bold text-base text-white mb-2">{point.title}</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {point.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
