import type { Metadata } from 'next';
import Breadcrumbs from '@/components/layout/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Terms of Service — MultiZest',
  description:
    'Read the official Terms of Service governing the use of MultiZest online browser tools, software licenses, disclaimers, and user agreements.',
  openGraph: {
    title: 'Terms of Service — MultiZest',
    description: 'Read the official Terms of Service governing the use of MultiZest.',
    url: 'https://multizest.com/terms-of-service',
  },
  alternates: {
    canonical: 'https://multizest.com/terms-of-service',
  },
};

export default function TermsOfServicePage() {
  const lastUpdated = 'September 2024';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <Breadcrumbs items={[{ name: 'Terms of Service', href: '/terms-of-service' }]} />

      <article className="prose dark:prose-invert max-w-none space-y-6 text-slate-700 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
        <header className="not-prose space-y-3 mb-8">
          <span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/50 inline-block">
            Terms of Use Agreement
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Terms of Service
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Last Updated: {lastUpdated} • Effective Date: Immediately
          </p>
        </header>

        <p className="lead font-medium text-slate-800 dark:text-slate-200">
          Welcome to MultiZest! These terms and conditions outline the rules and regulations for the use of MultiZest&apos;s Website, located at https://multizest.com. By accessing this website, we assume you accept these terms and conditions. Do not continue to use MultiZest if you do not agree to take all of the terms and conditions stated on this page.
        </p>

        <h2>1. Description of Service</h2>
        <p>
          MultiZest provides a suite of browser-based utilities including, but not limited to, PDF page extraction, image compression, image dimension resizing, word and text analysis, and QR code generation (collectively, the &quot;Services&quot;). The Services are executed entirely within the client&apos;s web browser utilizing modern HTML5, JavaScript, and WebAssembly APIs, without transmitting user files to MultiZest servers.
        </p>

        <h2>2. Intellectual Property Rights</h2>
        <p>
          Unless otherwise stated, MultiZest and/or its licensors own the intellectual property rights for all material on MultiZest, including brand design, trademarks, software code, stylesheets, typography, and original written blog articles. All intellectual property rights are reserved. You may access this from MultiZest for your own personal and commercial use subjected to restrictions set in these terms and conditions.
        </p>
        <p>
          <strong>Ownership of Your Processed Files:</strong> MultiZest claims absolutely zero ownership, copyright, or licensing rights over the files, text, images, or documents you process through our tools. All outputs, converted images, and generated QR codes remain your sole property.
        </p>

        <h2>3. Restrictions and Prohibited Uses</h2>
        <p>
          You are specifically restricted from all of the following:
        </p>
        <ul>
          <li>Publishing any website material in any other media without proper attribution;</li>
          <li>Selling, sublicensing, and/or otherwise commercializing the MultiZest source codebase;</li>
          <li>Using this Website in any way that is or may be damaging to this Website or impairs availability;</li>
          <li>Using this Website in any manner that impacts user access or stability through automated scraping, denial of service attacks, or bot spamming;</li>
          <li>Using this Website contrary to applicable laws and regulations, or in any way that may cause harm to the Website, or to any person or business entity;</li>
          <li>Engaging in any data mining, data harvesting, data extracting, or any other similar activity in relation to this Website.</li>
        </ul>

        <h2>4. Disclaimer of Warranties</h2>
        <p>
          This Website is provided &quot;as is,&quot; with all faults, and MultiZest expresses no representations or warranties, of any kind related to this Website or the materials contained on this Website. While we take pride in rigorous engineering and accurate algorithmic output, nothing contained on this Website shall be interpreted as advising you or guaranteeing fitness for any specific legal, financial, or industrial purpose.
        </p>
        <p>
          We do not guarantee that the operation of the website will be uninterrupted, bug-free, or entirely free of errors in client-side canvas rendering across legacy or unsupported mobile devices.
        </p>

        <h2>5. Limitation of Liability</h2>
        <p>
          In no event shall MultiZest, nor any of its officers, directors, and employees, be held liable for anything arising out of or in any way connected with your use of this Website whether such liability is under contract. MultiZest, including its officers, directors, and employees, shall not be held liable for any indirect, consequential, or special liability arising out of or in any way related to your use of this Website, including data loss resulting from device browser crashes during heavy file processing.
        </p>

        <h2>6. Indemnification</h2>
        <p>
          You hereby indemnify to the fullest extent MultiZest from and against any and/or all liabilities, costs, demands, causes of action, damages, and expenses arising in any way related to your breach of any of the provisions of these Terms.
        </p>

        <h2>7. Severability</h2>
        <p>
          If any provision of these Terms is found to be invalid under any applicable law, such provisions shall be deleted without affecting the remaining provisions herein.
        </p>

        <h2>8. Variation of Terms</h2>
        <p>
          MultiZest is permitted to revise these Terms at any time as it sees fit, and by using this Website you are expected to review these Terms on a regular basis to ensure you understand all terms and conditions governing the use of this Website.
        </p>

        <h2>9. Governing Law & Jurisdiction</h2>
        <p>
          These Terms will be governed by and interpreted in accordance with the laws of the jurisdiction in which MultiZest operates, and you submit to the non-exclusive jurisdiction of the state and federal courts for the resolution of any disputes.
        </p>

        <h2>10. Contacting Us</h2>
        <p>
          If you have questions about these Terms of Service, please reach out through our <a href="/contact">Contact Page</a> or write directly to <code>khuzaimajourney@gmail.com</code>.
        </p>
      </article>
    </div>
  );
}
