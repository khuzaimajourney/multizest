import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CookieConsent from '@/components/shared/CookieConsent';
import ScrollToTop from '@/components/shared/ScrollToTop';
import AdPlaceholder from '@/components/shared/AdPlaceholder';
import JsonLd from '@/components/shared/JsonLd';
import {
  generateWebsiteSchema,
  generateOrganizationSchema,
  generateSiteNavigationSchema,
  SITE_CONFIG,
} from '@/lib/seo-config';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  keywords: SITE_CONFIG.keywords,
  authors: [{ name: SITE_CONFIG.author, url: SITE_CONFIG.url }],
  creator: SITE_CONFIG.author,
  publisher: SITE_CONFIG.name,
  category: 'technology',
  classification: 'Online Tools and Browser Utilities',
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
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    title: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
    description: SITE_CONFIG.description,
    images: [
      {
        url: `${SITE_CONFIG.url}/api/og?title=MultiZest&category=Toolbox&desc=100%25+Free+Online+Tools+with+Client-Side+Privacy`,
        width: 1200,
        height: 630,
        alt: `${SITE_CONFIG.name} — Free Online Tools`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
    description: SITE_CONFIG.description,
    creator: SITE_CONFIG.twitterHandle,
    images: [`${SITE_CONFIG.url}/api/og?title=MultiZest&category=Toolbox&desc=100%25+Free+Online+Tools+with+Client-Side+Privacy`],
  },
  alternates: {
    canonical: SITE_CONFIG.url,
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || 'oTCXYUYWh7C_hM6Lc3yZjtGGJ_q8I5IH6CL-tpgvkoY',
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '192x192',
        url: '/icon-192.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '512x512',
        url: '/icon-512.png',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta
          name="google-site-verification"
          content="oTCXYUYWh7C_hM6Lc3yZjtGGJ_q8I5IH6CL-tpgvkoY"
        />
        {/* Anti-flash theme inline script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const storedTheme = localStorage.getItem('multizest-theme');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (storedTheme === 'dark' || (!storedTheme && prefersDark)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
        <JsonLd data={generateWebsiteSchema()} />
        <JsonLd data={generateOrganizationSchema()} />
        <JsonLd data={generateSiteNavigationSchema()} />
      </head>
      <body className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-blue-500 selection:text-white transition-colors duration-200">
        <Navbar />

        {/* Global top banner ad slot */}
        <div className="max-w-7xl mx-auto px-4 w-full pt-2">
          <AdPlaceholder slot="navbar-leaderboard-top" format="banner" />
        </div>

        <main className="flex-1 w-full" id="main-content">
          {children}
        </main>

        {/* Global bottom banner ad slot */}
        <div className="max-w-7xl mx-auto px-4 w-full pb-4">
          <AdPlaceholder slot="footer-leaderboard-bottom" format="leaderboard" />
        </div>

        <Footer />
        <CookieConsent />
        <ScrollToTop />
      </body>
    </html>
  );
}
