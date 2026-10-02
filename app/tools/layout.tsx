import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/seo-config';

export const metadata: Metadata = {
  title: 'All Free Online Tools — Fast, Private Browser Toolbox | MultiZest',
  description:
    'Browse our complete directory of free online tools. Convert PDFs, compress images, extract audio, generate QR codes, format JSON, count words, and resize pictures with 100% client-side privacy.',
  keywords: [
    'free online tools directory',
    'browser tools list',
    'pdf tools online free',
    'image tools free',
    'web developer tools',
    'free calculators online',
    'client side privacy tools',
    'no server upload tools',
    'multizest tools',
    'online utilities without sign up',
  ],
  alternates: {
    canonical: `${SITE_CONFIG.url}/tools`,
  },
  openGraph: {
    title: 'All Free Online Tools — MultiZest',
    description:
      'Browse our complete directory of lightning-fast online tools with 100% client-side privacy.',
    url: `${SITE_CONFIG.url}/tools`,
    siteName: SITE_CONFIG.name,
    images: [
      {
        url: `${SITE_CONFIG.url}/api/og?title=All+Online+Tools&category=Tool+Catalog&desc=Explore+lightning-fast+privacy-first+browser+utilities.`,
        width: 1200,
        height: 630,
        alt: 'MultiZest Tools Directory',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'All Free Online Tools — MultiZest',
    description:
      'Browse our complete directory of lightning-fast online tools with 100% client-side privacy.',
    creator: SITE_CONFIG.twitterHandle,
    images: [
      `${SITE_CONFIG.url}/api/og?title=All+Online+Tools&category=Tool+Catalog&desc=Explore+lightning-fast+privacy-first+browser+utilities.`,
    ],
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
