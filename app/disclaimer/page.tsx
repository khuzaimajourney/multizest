import type { Metadata } from 'next';
import Breadcrumbs from '@/components/layout/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Disclaimer — MultiZest',
  description:
    'Read the legal disclaimer for MultiZest. Important details regarding tool output accuracy, external links, educational resources, and professional advice.',
  openGraph: {
    title: 'Disclaimer — MultiZest',
    description: 'Read the legal disclaimer for MultiZest.',
    url: '/disclaimer',
  },
  alternates: {
    canonical: '/disclaimer',
  },
};

export default function DisclaimerPage() {
  const lastUpdated = 'September 2024';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <Breadcrumbs items={[{ name: 'Disclaimer', href: '/disclaimer' }]} />

      <article className="prose dark:prose-invert max-w-none space-y-6 text-slate-700 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
        <header className="not-prose space-y-3 mb-8">
          <span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/50 inline-block">
            Legal Disclosures
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Website Disclaimer
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Last Updated: {lastUpdated}
          </p>
        </header>

        <p className="lead font-medium text-slate-800 dark:text-slate-200">
          The information and utilities provided on MultiZest (https://multizest.com) are for general informational, educational, and productivity purposes only. All information on the site is provided in good faith; however, we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information or tool output on the site.
        </p>

        <h2>1. Tool Output & Client-Side Execution Disclaimer</h2>
        <p>
          Under no circumstance shall MultiZest have any liability to you for any loss or damage of any kind incurred as a result of the use of our site or reliance on any information or tool outputs provided on the site. Your use of the site and your reliance on any tools (including PDF to Image conversion, image compression, image dimension resizing, word counting, and QR code generation) is solely at your own risk.
        </p>
        <p>
          While our tools utilize standard image algorithms (Bicubic canvas interpolation, standard JPEG quantization, Reed-Solomon QR codes), subtle variations in browser implementations (e.g. differences in Apple WebKit vs. Google Blink rendering engines) may produce marginal differences in color gamut or compression ratios. Always verify mission-critical graphics and high-value QR codes before sending them to professional commercial printing presses.
        </p>

        <h2>2. External Links Disclaimer</h2>
        <p>
          The site may contain (or you may be sent through the site to) links to other websites or content belonging to or originating from third parties, or links to websites and features in banners or other advertising. Such external links are not investigated, monitored, or checked for accuracy, adequacy, validity, reliability, availability, or completeness by us.
        </p>
        <p>
          We do not warrant, endorse, guarantee, or assume responsibility for the accuracy or reliability of any information offered by third-party websites linked through the site or any website or feature linked in any banner or other advertising (such as Google AdSense advertisers). We will not be a party to or in any way be responsible for monitoring any transaction between you and third-party providers of products or services.
        </p>

        <h2>3. No Professional or Legal Advice</h2>
        <p>
          The site cannot and does not contain legal, financial, or engineering compliance advice. The educational guides and blog posts provided on MultiZest are published solely for general informational and educational purposes and are not a substitute for professional counsel. Accordingly, before taking any actions based upon such information, we encourage you to consult with the appropriate professionals.
        </p>

        <h2>4. &quot;Use at Your Own Risk&quot;</h2>
        <p>
          All tools are provided without charge on an &quot;as-is&quot; basis. You assume all responsibility and risk for the selection and use of the tools to achieve your intended results. Because file operations take place within your computer or mobile device&apos;s memory sandbox, ensure your system has adequate RAM when processing unusually large documents.
        </p>

        <h2>5. Contacting Us Regarding Disclaimers</h2>
        <p>
          If you require any more information or have any questions about our site&apos;s disclaimer, please feel free to reach out via our <a href="/contact">Contact Page</a> or email us at <code>khuzaimajourney@gmail.com</code>.
        </p>
      </article>
    </div>
  );
}
