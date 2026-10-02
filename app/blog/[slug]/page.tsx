import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Clock, Calendar, ArrowRight, User, Share2, Sparkles, BookOpen } from 'lucide-react';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import AdPlaceholder from '@/components/shared/AdPlaceholder';
import JsonLd from '@/components/shared/JsonLd';
import ToolCard from '@/components/tools/ToolCard';
import { BLOG_POSTS, getBlogPostBySlug } from '@/lib/blog-data';
import { getToolBySlug } from '@/lib/tools-data';
import { ToolItem, BlogPost } from '@/lib/types';
import { generateArticleSchema, SITE_CONFIG } from '@/lib/seo-config';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) {
    return { title: 'Post Not Found' };
  }

  const canonicalUrl = `${SITE_CONFIG.url}/blog/${post.slug}`;
  const ogImageUrl = `${SITE_CONFIG.url}/api/og?title=${encodeURIComponent(post.title)}&category=Blog+Post&desc=${encodeURIComponent(post.description)}`;

  return {
    title: `${post.title} — MultiZest Blog`,
    description: post.description,
    keywords: [
      ...post.tags,
      post.category.toLowerCase(),
      'multizest blog',
      'web tools guide',
      'client side tutorial',
    ],
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      url: canonicalUrl,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      creator: SITE_CONFIG.twitterHandle,
      images: [ogImageUrl],
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) notFound();

  const formattedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const relatedTools = post.relatedToolSlugs
    .map((s) => getToolBySlug(s))
    .filter((t): t is ToolItem => Boolean(t));

  const relatedBlogs = post.relatedBlogSlugs
    .map((s) => getBlogPostBySlug(s))
    .filter((b): b is BlogPost => Boolean(b));

  return (
    <>
      <JsonLd data={generateArticleSchema(post)} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <Breadcrumbs
          items={[
            { name: 'Blog', href: '/blog' },
            { name: post.title, href: `/blog/${post.slug}` },
          ]}
        />

        {/* Post Header */}
        <header className="mb-8 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/50">
              {post.category}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {post.readTime}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formattedDate}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            {post.title}
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            {post.description}
          </p>

          <div className="pt-2 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200">
              <User className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-slate-900 dark:text-white">{post.author.name}</div>
              <div className="text-[11px]">{post.author.role}</div>
            </div>
          </div>
        </header>

        {/* Hero Visual Cover Banner */}
        <div
          className={`w-full h-48 sm:h-64 rounded-3xl bg-gradient-to-r ${post.coverGradient} shadow-lg mb-8 flex items-center justify-center text-white text-center p-6`}
        >
          <div className="max-w-md">
            <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-80" />
            <span className="text-xs uppercase tracking-widest font-bold opacity-80 block">
              MultiZest Practical Engineering Guide
            </span>
            <span className="text-lg sm:text-xl font-bold mt-1 block">
              100% Client-Side Knowledge
            </span>
          </div>
        </div>

        {/* Ad Placement: Top of Article */}
        <AdPlaceholder slot="blog-article-top" format="responsive" />

        {/* Main Content Layout with Sticky Table of Contents */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-8 items-start">
          {/* Table of contents sidebar (4 cols on desktop) */}
          <aside className="lg:col-span-4 order-2 lg:order-1">
            <div className="sticky top-24 space-y-6">
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span>Table of Contents</span>
                </div>
                <nav className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  {post.toc.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className="block py-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {item.text}
                    </a>
                  ))}
                </nav>
              </div>

              {/* Sidebar ad */}
              <AdPlaceholder slot="blog-sidebar-rectangle" format="rectangle" />
            </div>
          </aside>

          {/* Article Body (8 cols) */}
          <main className="lg:col-span-8 order-1 lg:order-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-sm">
            <div
              className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed text-sm sm:text-base space-y-4"
              dangerouslySetInnerHTML={{ __html: post.contentHtml }}
            />

            {/* In-Article Ad Placement */}
            <div className="my-8">
              <AdPlaceholder slot="blog-in-article" format="responsive" />
            </div>

            {/* Tags footer */}
            <div className="pt-6 mt-8 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">Tags:</span>
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </main>
        </div>

        {/* Related Tools Callout */}
        {relatedTools.length > 0 && (
          <section className="my-12">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Mentioned & Recommended Tools
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Try the free client-side utilities referenced in this guide.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedTools.map((t) => (
                <ToolCard key={t.id} tool={t} />
              ))}
            </div>
          </section>
        )}

        {/* Related Articles Callout */}
        {relatedBlogs.length > 0 && (
          <section className="my-12 pt-8 border-t border-slate-200 dark:border-slate-800">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
              Related Articles
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {relatedBlogs.map((b) => (
                <Link
                  key={b!.slug}
                  href={`/blog/${b!.slug}`}
                  className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 shadow-sm transition-all group"
                >
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                    {b!.category}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1 group-hover:text-blue-600 transition-colors">
                    {b!.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                    {b!.description}
                  </p>
                  <div className="mt-4 flex items-center text-xs font-semibold text-blue-600 group-hover:translate-x-1 transition-transform">
                    <span>Read Guide</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
