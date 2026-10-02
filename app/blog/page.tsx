import type { Metadata } from 'next';
import Link from 'next/link';
import { Clock, Calendar, ArrowRight, BookOpen } from 'lucide-react';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import AdPlaceholder from '@/components/shared/AdPlaceholder';
import { BLOG_POSTS } from '@/lib/blog-data';
import { SITE_CONFIG } from '@/lib/seo-config';

export const metadata: Metadata = {
  title: 'Blog & Practical Guides — MultiZest',
  description:
    'Read in-depth guides, productivity tutorials, and performance optimization articles for web developers, creators, and students.',
  keywords: [
    'online tools guides',
    'image optimization tutorial',
    'pdf conversion guide',
    'browser performance engineering',
    'student productivity tools',
    'multizest blog',
  ],
  alternates: {
    canonical: `${SITE_CONFIG.url}/blog`,
  },
  openGraph: {
    title: 'Blog & Practical Guides — MultiZest',
    description:
      'Read in-depth guides, productivity tutorials, and performance optimization articles for web developers, creators, and students.',
    url: `${SITE_CONFIG.url}/blog`,
    siteName: SITE_CONFIG.name,
    images: [
      {
        url: `${SITE_CONFIG.url}/api/og?title=MultiZest+Blog&category=Guides&desc=In-depth+tutorials+and+performance+guides.`,
        width: 1200,
        height: 630,
        alt: 'MultiZest Blog',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog & Practical Guides — MultiZest',
    description:
      'Read in-depth guides, productivity tutorials, and performance optimization articles for web developers, creators, and students.',
    creator: SITE_CONFIG.twitterHandle,
    images: [
      `${SITE_CONFIG.url}/api/og?title=MultiZest+Blog&category=Guides&desc=In-depth+tutorials+and+performance+guides.`,
    ],
  },
};

export default function BlogListingPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <Breadcrumbs items={[{ name: 'Blog', href: '/blog' }]} />

      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">
          <BookOpen className="w-4 h-4" />
          <span>Guides & Engineering Insights</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          MultiZest Insights & Tutorials
        </h1>
        <p className="mt-3 text-base sm:text-lg text-slate-600 dark:text-slate-400">
          Practical guides on image optimization, student productivity workflows, QR code architecture, and client-side browser performance.
        </p>
      </div>

      <AdPlaceholder slot="blog-listing-top" format="banner" />

      {/* Blog Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 my-10">
        {BLOG_POSTS.map((post) => {
          const formattedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });

          return (
            <article
              key={post.slug}
              className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-500/40 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Gradient Cover Banner */}
                <div
                  className={`h-40 bg-gradient-to-tr ${post.coverGradient} p-5 flex flex-col justify-between text-white relative overflow-hidden`}
                >
                  <div className="flex items-center justify-between z-10">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-black/30 backdrop-blur-md">
                      {post.category}
                    </span>
                    <span className="text-xs font-medium flex items-center gap-1 bg-black/20 backdrop-blur-md px-2 py-0.5 rounded-md">
                      <Clock className="w-3.5 h-3.5" />
                      {post.readTime}
                    </span>
                  </div>

                  <div className="text-white/80 text-xs flex items-center gap-1 z-10">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formattedDate}</span>
                  </div>
                </div>

                <div className="p-6">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h2>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                    {post.description}
                  </p>
                </div>
              </div>

              <div className="px-6 pb-6 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  {post.author.name}
                </span>
                <Link
                  href={`/blog/${post.slug}`}
                  className="font-bold text-blue-600 dark:text-blue-400 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                >
                  <span>Read Article</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </article>
          );
        })}
      </div>

      <AdPlaceholder slot="blog-listing-bottom" format="responsive" />
    </div>
  );
}
