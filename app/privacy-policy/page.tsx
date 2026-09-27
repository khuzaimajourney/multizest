import type { Metadata } from 'next';
import Breadcrumbs from '@/components/layout/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Privacy Policy — MultiZest',
  description:
    'Read the complete MultiZest Privacy Policy. Learn how our 100% client-side architecture keeps your files strictly on your device, and how we handle analytics and advertising cookies.',
  openGraph: {
    title: 'Privacy Policy — MultiZest',
    description: 'Read the complete MultiZest Privacy Policy.',
    url: 'https://multizest.com/privacy-policy',
  },
  alternates: {
    canonical: 'https://multizest.com/privacy-policy',
  },
};

export default function PrivacyPolicyPage() {
  const lastUpdated = 'September 2024';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <Breadcrumbs items={[{ name: 'Privacy Policy', href: '/privacy-policy' }]} />

      <article className="prose dark:prose-invert max-w-none space-y-6 text-slate-700 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
        <header className="not-prose space-y-3 mb-8">
          <span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/50 inline-block">
            Legal & Data Compliance
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Last Updated: {lastUpdated} • Effective Date: Immediately
          </p>
        </header>

        <p className="lead font-medium text-slate-800 dark:text-slate-200">
          At MultiZest (accessible from https://multizest.com), one of our main priorities is the privacy of our visitors. This Privacy Policy document outlines the types of information that is collected and recorded by MultiZest and how we use it, with an absolute emphasis on our 100% client-side processing architecture.
        </p>

        <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs sm:text-sm text-emerald-900 dark:text-emerald-200 font-medium">
          <strong>The MultiZest Zero-Upload Guarantee:</strong> All file conversions, PDF extractions, image resizing, image compression, QR code generations, and word counting take place 100% locally in your web browser. Your private files, pictures, documents, and texts are never uploaded to, transmitted across, or stored upon our web servers.
        </div>

        <h2>1. Information We Do NOT Collect</h2>
        <p>
          Unlike conventional online utility platforms, MultiZest is deliberately engineered to minimize data collection:
        </p>
        <ul>
          <li><strong>No File Uploads:</strong> When you drag and drop an image or PDF into our tools, it is processed via browser APIs (HTML5 Canvas, File API, WebAssembly). We do not possess the technical capability to view, intercept, or retain your files.</li>
          <li><strong>No Mandatory Accounts:</strong> You do not need to register, provide your email, or create a password to use any tool on MultiZest.</li>
          <li><strong>No Financial Data:</strong> All tools are free; we do not request or store credit card or payment information.</li>
        </ul>

        <h2>2. Information We Automatically Collect (Log Files & Analytics)</h2>
        <p>
          Like almost all websites, MultiZest follows a standard procedure of utilizing log files. The information gathered by standard hosting web server logs includes:
        </p>
        <ul>
          <li>Internet Protocol (IP) addresses (anonymized where applicable)</li>
          <li>Browser type and version (e.g. Chrome, Firefox, Safari)</li>
          <li>Operating system (e.g. Windows, macOS, Android, iOS)</li>
          <li>Internet Service Provider (ISP)</li>
          <li>Date and time stamp of access</li>
          <li>Referring / exit pages and navigation paths</li>
          <li>Number of clicks to analyze trends and administer the platform</li>
        </ul>
        <p>
          These data points are not linked to any personally identifiable information. The purpose of this information is strictly for diagnosing technical errors, defending against denial-of-service cyberattacks, and assessing aggregated user traffic.
        </p>

        <h2>3. Cookies and Web Beacons</h2>
        <p>
          MultiZest uses &apos;cookies&apos; to store information including visitors&apos; preferences (such as your chosen Dark/Light theme mode and cookie consent preferences), and the pages on the website that the visitor accessed or visited.
        </p>
        <p>
          You can choose to disable cookies through your individual browser options. Detailed information about cookie management with specific web browsers can be found at the browsers&apos; respective websites.
        </p>

        <h2>4. Google DoubleClick DART Cookies & Google AdSense</h2>
        <p>
          Google is a third-party vendor on our site. It uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to MultiZest and other sites on the internet.
        </p>
        <ul>
          <li>Google&apos;s use of advertising cookies enables it and its partners to serve ads to our users based on their visit to our sites and/or other sites on the Internet.</li>
          <li>Visitors may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">Google Ads Settings</a>.</li>
          <li>Alternatively, you can opt out of a third-party vendor&apos;s use of cookies for personalized advertising by visiting <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer">aboutads.info</a>.</li>
        </ul>

        <h2>5. Our Advertising Partners</h2>
        <p>
          Some of the advertisers on our site may use cookies and web beacons. Our primary advertising partner is <strong>Google AdSense</strong>. Third-party ad servers or ad networks use technologies like cookies, JavaScript, or Web Beacons that are used in their respective advertisements and links that appear on MultiZest, which are sent directly to users&apos; browsers. They automatically receive your IP address when this occurs. These technologies are used to measure the effectiveness of their advertising campaigns and/or to personalize the advertising content that you see on websites that you visit.
        </p>
        <p>
          Note that MultiZest has no access to or control over these cookies that are used by third-party advertisers.
        </p>

        <h2>6. Third-Party Privacy Policies</h2>
        <p>
          MultiZest&apos;s Privacy Policy does not apply to other advertisers or websites. Thus, we advise you to consult the respective Privacy Policies of these third-party ad servers for more detailed information. It may include their practices and instructions about how to opt-out of certain options.
        </p>

        <h2>7. CCPA Privacy Rights (Do Not Sell My Personal Information)</h2>
        <p>
          Under the California Consumer Privacy Act (CCPA), among other rights, California consumers have the right to:
        </p>
        <ul>
          <li>Request that a business that collects a consumer&apos;s personal data disclose the categories and specific pieces of personal data that a business has collected about consumers.</li>
          <li>Request that a business delete any personal data about the consumer that a business has collected.</li>
          <li>Request that a business that sells a consumer&apos;s personal data, not sell the consumer&apos;s personal data. MultiZest does not sell personal data.</li>
        </ul>
        <p>
          If you make a request, we have one month to respond to you. If you would like to exercise any of these rights, please contact us.
        </p>

        <h2>8. GDPR Data Protection Rights</h2>
        <p>
          We would like to make sure you are fully aware of all of your data protection rights under the General Data Protection Regulation (GDPR). Every user is entitled to the following:
        </p>
        <ul>
          <li><strong>The right to access:</strong> You have the right to request copies of your personal data.</li>
          <li><strong>The right to rectification:</strong> You have the right to request that we correct any information you believe is inaccurate.</li>
          <li><strong>The right to erasure:</strong> You have the right to request that we erase your personal data, under certain conditions.</li>
          <li><strong>The right to restrict processing:</strong> You have the right to request that we restrict the processing of your personal data, under certain conditions.</li>
          <li><strong>The right to data portability:</strong> You have the right to request that we transfer the data that we have collected to another organization, or directly to you.</li>
        </ul>

        <h2>9. Children&apos;s Information (COPPA Compliance)</h2>
        <p>
          Another part of our priority is adding protection for children while using the internet. We encourage parents and guardians to observe, participate in, and/or monitor and guide their online activity.
        </p>
        <p>
          MultiZest does not knowingly collect any Personal Identifiable Information from children under the age of 13. If you think that your child provided this kind of information on our website, we strongly encourage you to contact us immediately and we will do our best efforts to promptly remove such information from our records.
        </p>

        <h2>10. Changes to This Privacy Policy</h2>
        <p>
          We may update our Privacy Policy from time to time. Thus, we advise you to review this page periodically for any changes. We will notify you of any changes by posting the new Privacy Policy on this page. These changes are effective immediately after they are posted on this page.
        </p>

        <h2>11. Contact Us</h2>
        <p>
          If you have any questions, suggestions, or concerns regarding our Privacy Policy or data protection practices, please do not hesitate to contact our compliance team via our <a href="/contact">Contact Page</a> or by writing directly to <code>khuzaimajourney@gmail.com</code>.
        </p>
      </article>
    </div>
  );
}
