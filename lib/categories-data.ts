import { CategoryInfo } from './types';

export const CATEGORIES_DATA: CategoryInfo[] = [
  {
    id: 'pdf-tools',
    name: 'PDF Tools',
    slug: 'pdf-tools',
    iconName: 'FileText',
    description: 'Convert, merge, compress, and manipulate PDF documents right in your web browser. 100% private with no server uploads.',
    color: 'from-blue-500 to-indigo-600',
    benefits: [
      {
        title: 'Zero Server Uploads',
        description: 'Your confidential legal documents, bank statements, and personal contracts never leave your browser sandbox.',
      },
      {
        title: 'Unlimited Free Usage',
        description: 'No daily conversion quotas, page limit cutoffs, or hidden subscription paywalls.',
      },
      {
        title: 'Native Browser Speed',
        description: 'Harnesses WebAssembly and Web Workers for near-instant rendering and compilation.',
      },
    ],
    faqs: [
      {
        question: 'Are my PDF files safe when using MultiZest PDF tools?',
        answer: 'Yes, 100%. All PDF processing runs entirely on your local device CPU using HTML5 Canvas and client-side JavaScript. No file data is ever transmitted across the internet.',
      },
      {
        question: 'What is the maximum PDF size supported?',
        answer: 'You can process PDFs up to 50MB. Because operations run on device memory, modern laptops and phones can process hundreds of pages smoothly.',
      },
      {
        question: 'Can I use MultiZest PDF tools on mobile phones?',
        answer: 'Yes! All PDF tools are responsive and work on mobile browsers including Safari on iOS and Chrome on Android.',
      },
    ],
  },
  {
    id: 'image-tools',
    name: 'Image Tools',
    slug: 'image-tools',
    iconName: 'Image',
    description: 'Compress, resize, convert, and crop images without compromising visual fidelity. Ideal for social media, bloggers, and web performance.',
    color: 'from-violet-500 to-purple-600',
    benefits: [
      {
        title: 'Intelligent Compression',
        description: 'Perceptual lossy and lossless algorithms reduce file sizes by up to 80% while keeping visuals sharp.',
      },
      {
        title: 'Social Media Presets',
        description: 'One-click resizing for Instagram, YouTube, Facebook, Twitter/X, and LinkedIn.',
      },
      {
        title: 'Batch Processing',
        description: 'Upload and optimize up to 10 images simultaneously with instant ZIP archive export.',
      },
    ],
    faqs: [
      {
        question: 'Which image formats are supported?',
        answer: 'Our image tools support JPG, PNG, WebP, GIF, and BMP formats for compression, resizing, cropping, and conversion.',
      },
      {
        question: 'Will compressing my images ruin their quality?',
        answer: 'Our default 80% quality setting uses perceptual quantization to strip unnoticeable data, leaving human eye visuals virtually indistinguishable from the master original.',
      },
      {
        question: 'Are image files uploaded to a remote server?',
        answer: 'No. Canvas API and browser image compression execute locally on your GPU/CPU for complete privacy.',
      },
    ],
  },
  {
    id: 'text-tools',
    name: 'Text Tools',
    slug: 'text-tools',
    iconName: 'FileEdit',
    description: 'Count words, transform letter cases, generate placeholder lorem ipsum, and read text aloud with natural speech synthesis.',
    color: 'from-amber-500 to-orange-600',
    benefits: [
      {
        title: 'Real-Time Dynamic Metrics',
        description: 'Track words, characters, sentences, paragraphs, reading speed, and speaking duration on every keystroke.',
      },
      {
        title: 'Case Conversion Precision',
        description: 'Switch between 10 formatting styles: UPPERCASE, lowercase, Title Case, camelCase, snake_case, and more.',
      },
      {
        title: 'Native Speech Synthesis',
        description: 'Proofread and listen to your prose with natural browser voices at variable speeds.',
      },
    ],
    faqs: [
      {
        question: 'How is reading time calculated in the Word Counter?',
        answer: 'Reading time is calculated at the standard adult silent reading rate of 200 words per minute, and speaking time is calculated at 130 words per minute.',
      },
      {
        question: 'Is there any limit to the amount of text I can analyze?',
        answer: 'No. You can paste entire book chapters, dissertation drafts, or transcripts with tens of thousands of words without latency.',
      },
      {
        question: 'Does Text to Speech send my text to an AI cloud API?',
        answer: 'No. It utilizes the native Web Speech API built directly into your operating system and browser.',
      },
    ],
  },
  {
    id: 'generator-tools',
    name: 'Generator Tools',
    slug: 'generator-tools',
    iconName: 'QrCode',
    description: 'Generate customizable permanent QR codes, cryptographically secure random passwords, and inspect color palettes with WCAG contrast auditing.',
    color: 'from-emerald-500 to-teal-600',
    benefits: [
      {
        title: 'Permanent Static QR Codes',
        description: 'Encode URLs, WiFi credentials, and emails directly. No expiration dates, no redirects, no subscriptions.',
      },
      {
        title: 'Web Crypto Security',
        description: 'Passwords generated via crypto.getRandomValues() for bank-grade randomness that cannot be predicted.',
      },
      {
        title: 'Design-Ready Assets',
        description: 'Export QR codes in crisp SVG vectors or high-res PNGs, and copy color values across HEX, RGB, HSL, and CMYK.',
      },
    ],
    faqs: [
      {
        question: 'Do the generated QR codes expire?',
        answer: 'Never. These are direct static QR codes. The payload is hard-coded into the pixel grid and will function forever without subscriptions.',
      },
      {
        question: 'Are generated passwords saved in your database?',
        answer: 'No. Generated passwords exist solely in your local browser state and are permanently discarded when you close or reload the page.',
      },
      {
        question: 'Can I generate a WiFi QR code for guests?',
        answer: 'Yes! Enter your WiFi SSID and password, scan with an iPhone or Android camera, and guests connect automatically without typing passwords.',
      },
    ],
  },
  {
    id: 'developer-tools',
    name: 'Developer Tools',
    slug: 'developer-tools',
    iconName: 'Code',
    description: 'Format and validate messy JSON, encode/decode Base64 strings and files, and compose GitHub-flavored Markdown with live side-by-side preview.',
    color: 'from-cyan-500 to-blue-600',
    benefits: [
      {
        title: 'Line-Accurate Syntax Validation',
        description: 'Instantly pinpoint JSON parsing errors with line numbers and character offsets.',
      },
      {
        title: 'Dual Mode Base64 Engine',
        description: 'Encode and decode both raw ASCII/UTF-8 strings and binary files into data URLs.',
      },
      {
        title: 'GitHub-Flavored Markdown',
        description: 'Live preview with support for tables, task lists, strikethroughs, and fenced code blocks.',
      },
    ],
    faqs: [
      {
        question: 'Are developer tokens or JSON payloads sent to any API?',
        answer: 'Zero network calls are made. Formatting, Base64 encoding, and Markdown parsing all execute 100% locally in your browser.',
      },
      {
        question: 'Can I decode Base64 back into an image or file?',
        answer: 'Yes! Paste your Base64 string into the File mode to download the decoded binary file directly to your drive.',
      },
      {
        question: 'Does the Markdown Preview support exporting to HTML?',
        answer: 'Yes, you can copy the raw Markdown, copy the compiled HTML, or download a .md file with one click.',
      },
    ],
  },
  {
    id: 'calculator-tools',
    name: 'Calculator Tools',
    slug: 'calculator-tools',
    iconName: 'Calculator',
    description: 'Calculate your exact age down to minutes, solve any percentage problem with step-by-step formulas, and evaluate Body Mass Index (BMI).',
    color: 'from-rose-500 to-pink-600',
    benefits: [
      {
        title: 'Step-by-Step Mathematical Proofs',
        description: 'View the underlying algebraic equations behind percentage increases, discounts, and margin shifts.',
      },
      {
        title: 'Metric & Imperial Flexibility',
        description: 'Switch between centimeters/kilograms and feet/inches/pounds seamlessly with instant recalculation.',
      },
      {
        title: 'Visual Representation',
        description: 'Color-coded BMI category scales and age breakdowns into years, months, weeks, days, and hours.',
      },
    ],
    faqs: [
      {
        question: 'How accurate is the Age Calculator?',
        answer: 'It calculates exact chronological duration factoring in varying month lengths and leap years across history.',
      },
      {
        question: 'What percentage calculations are supported?',
        answer: 'We support 5 standard modes: What is X% of Y, X is what % of Y, Percentage Change, Percentage Increase, and Percentage Decrease.',
      },
      {
        question: 'Is BMI calculation suitable for everyone?',
        answer: 'BMI provides a general screening guideline for adult body mass relative to height, but does not distinguish between muscle mass and fat tissue.',
      },
    ],
  },
];

export function getCategoryBySlug(slug: string): CategoryInfo | undefined {
  return CATEGORIES_DATA.find((c) => c.slug === slug);
}
