import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/seo-config';

export const metadata: Metadata = {
  title: 'All 31 Free Online Tools — Fast, Private Browser Toolbox | MultiZest',
  description:
    'Browse our complete directory of 31 lightning-fast online tools. Convert PDFs, compress images, extract audio, generate QR codes, and more with zero server uploads.',
  keywords: [
    'free online tools directory',
    'browser tools list',
    'pdf tools online',
    'image tools free',
    'web tools',
    'multizest tools',
  ],
  alternates: {
    canonical: '/tools',
  },
  openGraph: {
    title: 'All 31 Free Online Tools — MultiZest',
    description:
      'Browse our complete directory of 31 lightning-fast online tools with 100% client-side privacy.',
    url: '/tools',
    siteName: SITE_CONFIG.name,
    images: [
      {
        url: '/api/og?title=All+31+Online+Tools&category=Tool+Catalog&desc=Explore+31+lightning-fast+privacy-first+browser+utilities.',
        width: 1200,
        height: 630,
        alt: 'MultiZest Tools Directory',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'All 31 Free Online Tools — MultiZest',
    description:
      'Browse our complete directory of 31 lightning-fast online tools with 100% client-side privacy.',
    creator: SITE_CONFIG.twitterHandle,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
