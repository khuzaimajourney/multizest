import type { Metadata } from 'next';
import Breadcrumbs from '@/components/layout/Breadcrumbs';

export const metadata: Metadata = {
  title: 'DMCA Policy — MultiZest',
  description:
    'Read the Digital Millennium Copyright Act (DMCA) policy for MultiZest. Instructions for copyright owners regarding infringement notices and counter-notifications.',
  openGraph: {
    title: 'DMCA Policy — MultiZest',
    description: 'Read the Digital Millennium Copyright Act (DMCA) policy for MultiZest.',
    url: 'https://multizest.com/dmca',
  },
  alternates: {
    canonical: 'https://multizest.com/dmca',
  },
};

export default function DmcaPage() {
  const lastUpdated = 'September 2024';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <Breadcrumbs items={[{ name: 'DMCA Policy', href: '/dmca' }]} />

      <article className="prose dark:prose-invert max-w-none space-y-6 text-slate-700 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
        <header className="not-prose space-y-3 mb-8">
          <span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-200/60 dark:border-violet-900/50 inline-block">
            Intellectual Property Protection
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            DMCA Copyright Policy
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Last Updated: {lastUpdated}
          </p>
        </header>

        <p className="lead font-medium text-slate-800 dark:text-slate-200">
          MultiZest (&quot;MultiZest,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) respects the intellectual property rights of others and expects our users to do the same. In accordance with the Digital Millennium Copyright Act (DMCA), Title 17, United States Code, Section 512(c), copyright owners or their authorized agents may submit a takedown notification to us if they believe their works have been infringed.
        </p>

        <div className="p-5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs sm:text-sm text-blue-900 dark:text-blue-200 font-medium">
          <strong>Important Architecture Note:</strong> MultiZest does not host, store, archive, or publicly publish user files. All tools (PDF to Image, Image Compressor, Resizer, etc.) execute strictly inside the client&apos;s browser. There are no user-uploaded files hosted on our servers that can be publicly downloaded by other users.
        </div>

        <h2>1. Submitting a Notice of Copyright Infringement</h2>
        <p>
          If you believe that your copyrighted work has been copied in a way that constitutes copyright infringement on our website (for instance, within our original blog editorial content or website graphic layout), please provide our designated Copyright Agent with a written notification containing the following information:
        </p>
        <ol>
          <li>A physical or electronic signature of a person authorized to act on behalf of the owner of an exclusive right that is allegedly infringed;</li>
          <li>Identification of the copyrighted work claimed to have been infringed, or, if multiple copyrighted works at a single online site are covered by a single notification, a representative list of such works;</li>
          <li>Identification of the material that is claimed to be infringing or to be the subject of infringing activity and that is to be removed or access to which is to be disabled, and information reasonably sufficient to permit us to locate the material (such as the specific URL);</li>
          <li>Information reasonably sufficient to permit the service provider to contact the complaining party, such as an address, telephone number, and email address;</li>
          <li>A statement that the complaining party has a good faith belief that use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law;</li>
          <li>A statement that the information in the notification is accurate, and under penalty of perjury, that the complaining party is authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.</li>
        </ol>

        <h2>2. Counter-Notification Procedure</h2>
        <p>
          If material that you posted to MultiZest has been taken down as a result of a DMCA notification, you may file a counter-notification with our Copyright Agent. The counter-notification must contain substantially the following information:
        </p>
        <ul>
          <li>Your physical or electronic signature;</li>
          <li>Identification of the material that has been removed or to which access has been disabled and the location at which the material appeared before it was removed or disabled;</li>
          <li>A statement under penalty of perjury that you have a good faith belief that the material was removed or disabled as a result of mistake or misidentification;</li>
          <li>Your name, address, and telephone number, and a statement that you consent to the jurisdiction of the Federal Court for the judicial district in which your address is located, or if your address is outside of the United States, for any judicial district in which the service provider may be found.</li>
        </ul>

        <h2>3. Designated DMCA Copyright Agent</h2>
        <p>
          Please send all DMCA notices and counter-notices to our designated agent:
        </p>
        <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs sm:text-sm font-mono space-y-1">
          <div>MultiZest Legal & Compliance Team</div>
          <div>Attn: DMCA Copyright Agent</div>
          <div>Email: khuzaimajourney@gmail.com</div>
          <div>Subject Line: DMCA Takedown Notice — MultiZest</div>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Note: Under Section 512(f) of the DMCA, any person who knowingly materially misrepresents that material or activity is infringing may be subject to liability for damages.
        </p>
      </article>
    </div>
  );
}
