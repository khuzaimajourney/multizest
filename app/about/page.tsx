import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, Zap, Heart, CheckCircle2, ArrowRight } from 'lucide-react';
import Breadcrumbs from '@/components/layout/Breadcrumbs';

export const metadata: Metadata = {
  title: 'About MultiZest — Your Trusted Online Tool Platform',
  description:
    'Learn about MultiZest, our core mission to provide free, fast, and 100% privacy-focused online tools, and our commitment to client-side computing.',
  openGraph: {
    title: 'About MultiZest — Your Trusted Online Tool Platform',
    description:
      'Learn about MultiZest, our core mission to provide free, fast, and 100% privacy-focused online tools.',
    url: 'https://multizest.com/about',
  },
  alternates: {
    canonical: 'https://multizest.com/about',
  },
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <Breadcrumbs items={[{ name: 'About Us', href: '/about' }]} />

      <div className="space-y-10">
        <header className="space-y-4">
          <span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/50 inline-block">
            Our Story & Mission
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            Empowering Everyday Creators With Fast, Free, and Private Web Tools
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            MultiZest was founded on a simple conviction: performing basic digital tasks like compressing photos, converting documents, or generating QR codes should never require invasive software downloads, monthly subscription fees, or sacrificing your privacy.
          </p>
        </header>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 my-8">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 w-fit mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Privacy First</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              Every tool runs 100% locally in your web browser. Your private documents and photos never touch a remote server.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 w-fit mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Blazing Fast</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              No server queues or upload bottlenecks. Computations run at native hardware speeds utilizing HTML5 and WebAssembly.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 w-fit mb-4">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">100% Free Forever</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              No paywalls, no forced account registrations, no email collection, and no watermarks placed on your exported files.
            </p>
          </div>
        </div>

        {/* Detailed Narrative Section */}
        <section className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 space-y-6 text-sm sm:text-base leading-relaxed">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Who We Are</h2>
          <p>
            MultiZest is built and maintained by an independent group of software engineers, digital media designers, and privacy advocates. Throughout our careers in web development and content publishing, we repeatedly observed how frustrating simple digital workflows had become on the modern web. Traditional file conversion websites often barrage users with deceptive download buttons, enforce aggressive upload limits, or secretly store user uploads on remote database servers.
          </p>
          <p>
            We set out to build the exact antidote: a clean, elegant, transparent toolbox that harnesses the modern power of your own web browser. With technologies like HTML5 Canvas, Web Workers, client-side cryptographic hashing, and WebAssembly, modern laptops and smartphones can compress images, analyze prose, and render multi-page PDFs faster than any remote server cluster.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Our Core Values</h2>
          <ul className="space-y-3 list-none pl-0">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                <strong>Uncompromising Data Privacy:</strong> We believe your personal photos, tax documents, essay drafts, and passwords belong exclusively to you. By designing every tool to execute locally within the client sandbox, we ensure zero retention and zero leakage by design.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                <strong>Universal Accessibility:</strong> MultiZest requires no installations, native extensions, or modern graphics hardware. It is thoroughly optimized for all screen sizes, touch devices, and modern web browsers.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                <strong>Simplicity & Craftsmanship:</strong> We eliminate clutter, deceptive advertisements, and unnecessary multistep wizards. We believe in providing one-click clarity for every tool we build.
              </span>
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Our Sustainable Business Model</h2>
          <p>
            You might wonder: <em>how is MultiZest maintained if it is completely free?</em> We support hosting costs, domain infrastructure, and ongoing software development exclusively through ethical, family-friendly display advertising delivered by Google AdSense. We do not sell user data, collect email addresses for marketing spam, or charge hidden subscription fees.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Looking to the Future</h2>
          <p>
            The five utilities currently featured on MultiZest are just the beginning. Our engineering roadmap includes expanding our catalog into audio processing, code formatters, unit converters, markdown previews, and client-side cryptography. We welcome your ideas, feedback, and bug reports as we build the web&apos;s most trustworthy digital workshop.
          </p>
        </section>

        {/* Contact CTA */}
        <div className="p-8 rounded-3xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Have a Question or Idea?</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              We respond to every user message within 24 to 48 business hours.
            </p>
          </div>
          <Link
            href="/contact"
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 shrink-0 inline-flex items-center gap-2"
          >
            <span>Get in Touch</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
