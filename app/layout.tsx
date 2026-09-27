import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CookieConsent from '@/components/shared/CookieConsent';
import ScrollToTop from '@/components/shared/ScrollToTop';
import AdPlaceholder from '@/components/shared/AdPlaceholder';
import JsonLd from '@/components/shared/JsonLd';
import { generateWebsiteSchema, generateOrganizationSchema, SITE_CONFIG } from '@/lib/seo-config';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  keywords: SITE_CONFIG.keywords,
  authors: [{ name: SITE_CONFIG.author }],
  creator: SITE_CONFIG.author,
  publisher: SITE_CONFIG.name,
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
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
    description: SITE_CONFIG.description,
    creator: SITE_CONFIG.twitterHandle,
  },
  alternates: {
    canonical: SITE_CONFIG.url,
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
