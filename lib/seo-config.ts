import type { Metadata } from 'next';
import { ToolItem, ToolFAQ, BlogPost, CategoryInfo } from './types';
import { getToolBySlug } from './tools-data';

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://multizest.vercel.app';

export const SITE_CONFIG = {
  name: 'MultiZest',
  tagline: 'All-in-One Free Online Toolbox — Fast, Private & Browser-Based',
  description:
    'MultiZest is your 100% free, private online toolbox. Compress images, convert PDFs, generate QR codes, count words, format JSON, remove backgrounds, and resize photos directly in your browser with zero server uploads.',
  url: SITE_URL,
  keywords: [
    // Core Brand & Value Proposition
    'free online tools',
    'online utilities',
    'browser based tools',
    'client side privacy',
    'no file upload tools',
    'free web utilities without login',
    'multizest',
    'multizest toolbox',
    'instant online tools',
    'privacy first tools',
    
    // PDF Tools High-Intent Keywords
    'pdf to image converter online',
    'convert pdf to jpg free',
    'convert pdf to png online',
    'merge pdf files free without upload',
    'combine pdfs online free',
    'compress pdf file online',
    'reduce pdf size without losing quality',
    'split pdf pages online free',
    'rotate pdf pages permanently',
    'extract pages from pdf free',
    'images to pdf converter online',
    
    // Image Tools High-Intent Keywords
    'image compressor online free',
    'reduce image size in kb',
    'compress image to 50kb 100kb',
    'compress png jpg webp online',
    'image resizer online free in pixels',
    'resize photo without losing quality',
    'image converter jpg to png to webp',
    'crop image online free circle custom',
    'remove background from image free online',
    'transparent background maker hd',
    'watermark image online add copyright',
    'lossless image compressor',
    
    // Text Tools High-Intent Keywords
    'word counter online character count',
    'character count with spaces without spaces',
    'reading time calculator',
    'case converter uppercase lowercase titlecase',
    'lorem ipsum generator dummy text',
    'text to speech online free natural voices',
    'text diff checker compare text differences',
    
    // Generator Tools High-Intent Keywords
    'qr code generator free with logo',
    'permanent static qr code maker',
    'wifi qr code generator',
    'strong password generator crypto secure',
    'color picker from image hex rgb hsl',
    'wcag color contrast checker',
    
    // Developer Tools High-Intent Keywords
    'json formatter and validator online',
    'clean json beautifier pretty print',
    'base64 encoder decoder string and image',
    'markdown preview live editor github flavored',
    'json to csv converter online free',
    'meta tags generator for seo',
    'utm builder campaign link creator',
    
    // Calculator & Media High-Intent Keywords
    'age calculator from date of birth',
    'percentage calculator percentage increase decrease',
    'bmi calculator metric imperial body mass index',
    'video to audio converter mp4 to mp3 free',
  ],
  author: 'MultiZest Team',
  twitterHandle: '@multizest',
  contactEmail: 'khuzaimajourney@gmail.com',
};

// Comprehensive High-Traffic Search Keywords for each tool
export const TOOL_KEYWORDS_MAP: Record<string, string[]> = {
  'pdf-to-image': [
    'pdf to image converter',
    'convert pdf to jpg online free',
    'convert pdf to png high resolution',
    'extract images from pdf',
    'turn pdf into picture',
    'pdf to image no server upload',
    'free client side pdf to image',
    'batch pdf to jpg converter',
    'extract pdf pages as images',
    'pdf to image zip download',
    'high quality pdf page rasterizer',
    'pdf to jpeg free',
  ],
  'merge-pdf': [
    'merge pdf files online free',
    'combine multiple pdf into one',
    'merge pdf without file upload',
    'pdf combiner client side',
    'reorder and merge pdf pages',
    'free pdf joiner no limits',
    'merge contracts invoices documents',
    'combine pdf offline in browser',
    'best free pdf merger 2026',
    'unlimited pdf merger free',
  ],
  'compress-pdf': [
    'compress pdf online free',
    'reduce pdf file size without losing quality',
    'compress pdf to 100kb 200kb 500kb',
    'shrink pdf file size',
    'client side pdf compressor',
    'free pdf size reducer',
    'optimize pdf for email upload',
    'lossless pdf compression in browser',
    'compress pdf without watermark',
    'secure pdf compression',
  ],
  'split-pdf': [
    'split pdf online free',
    'extract pages from pdf document',
    'separate pdf into individual pages',
    'split pdf by page range',
    'cut pdf pages online',
    'split pdf without uploading to server',
    'free pdf splitter no sign up',
    'extract selected pdf pages',
    'save individual pdf pages',
  ],
  'rotate-pdf': [
    'rotate pdf pages permanently online',
    'rotate pdf 90 degrees clockwise',
    'flip pdf upside down',
    'fix upside down scanned pdf',
    'rotate all pages in pdf free',
    'rotate single page in pdf',
    'browser pdf page orientation fixer',
    'save rotated pdf document free',
  ],
  'image-compressor': [
    'image compressor online free',
    'reduce image size in kb',
    'compress jpg png webp',
    'compress image to 50kb 100kb',
    'photo size reducer without losing quality',
    'bulk image compressor',
    'lossless photo compression in browser',
    'free image optimizer for web',
    'speed up website image compressor',
    'batch compress photos zip download',
  ],
  'image-resizer': [
    'image resizer online free in pixels',
    'resize photo dimensions width height',
    'resize image for instagram post story',
    'resize image for youtube banner thumbnail',
    'resize picture without losing quality',
    'maintain aspect ratio image resizer',
    'photo resolution changer online',
    'social media image resizer presets',
    'resize image in kb mb',
  ],
  'image-converter': [
    'image converter online free',
    'convert jpg to png',
    'convert png to webp',
    'convert webp to jpg',
    'convert image format in browser',
    'transparent png converter',
    'bulk image format converter',
    'modern webp converter online',
    'lossless format conversion free',
  ],
  'image-cropper': [
    'image cropper online free',
    'crop photo to circle square 16:9 4:3 1:1',
    'crop picture for profile photo avatar',
    'online photo cutter tool',
    'custom aspect ratio image cropper',
    'free client side image cropper',
    'crop image without losing resolution',
  ],
  'watermark-image': [
    'watermark image online free',
    'add text watermark to photo',
    'protect image copyright watermark',
    'batch watermark photos',
    'transparent watermark creator',
    'add logo watermark to images',
    'custom font color opacity watermark',
    'copyright protection for photographers',
  ],
  'remove-background': [
    'remove background from image free online',
    'transparent background maker hd',
    'bg remover online no sign up',
    'cut out photo background free',
    'automatic background removal ai',
    'white background remover',
    'transparent png maker online',
    'product photo background remover',
  ],
  'word-counter': [
    'word counter online',
    'character count with spaces without spaces',
    'sentence counter paragraph counter',
    'reading time calculator',
    'speaking time calculator',
    'essay word count tool',
    'social media post character limit checker',
    'live text statistics analyzer',
    'free word counter no character limits',
  ],
  'case-converter': [
    'case converter online',
    'convert uppercase to lowercase',
    'title case converter online free',
    'sentence case generator',
    'camelcase snake_case kebab-case converter',
    'capitalize each word online',
    'alternating case text generator',
    'programming variable naming converter',
  ],
  'lorem-ipsum-generator': [
    'lorem ipsum generator',
    'dummy text generator online free',
    'placeholder text maker for mockups',
    'generate lorem ipsum paragraphs sentences words',
    'lipsum generator for web designers',
    'latin dummy text copy paste',
    'html wrapped placeholder text',
  ],
  'text-to-speech': [
    'text to speech online free natural voices',
    'read text aloud in browser',
    'listen to text speech synthesizer',
    'proofread text with audio speech',
    'web speech api text reader',
    'multi language voice synthesizer',
    'text to audio player no limit',
  ],
  'text-diff-checker': [
    'text diff checker online free',
    'compare two texts for differences',
    'code diff comparison tool',
    'character by character difference finder',
    'side by side text comparison',
    'highlight added and deleted text',
    'plagiarism proofreading diff tool',
  ],
  'qr-code-generator': [
    'qr code generator free with logo',
    'permanent static qr code maker',
    'custom color qr code generator',
    'wifi qr code creator for guests',
    'url qr code generator vector svg png',
    'high resolution printable qr code',
    'free qr code with no expiration date',
    'vcard email sms qr code maker',
  ],
  'password-generator': [
    'strong password generator',
    'secure random password maker online',
    'crypto random values password generator',
    'unhackable password creator',
    'memorable passphrase generator',
    'custom length password with symbols numbers',
    'bank grade password generator free',
  ],
  'color-picker': [
    'color picker hex rgb hsl cmyk',
    'eyedropper tool color finder',
    'pick color from image online',
    'wcag color contrast checker',
    'web color palette generator',
    'html css color code generator',
    'design color scheme creator',
  ],
  'json-formatter': [
    'json formatter and validator online',
    'clean json beautifier pretty print',
    'fix invalid json syntax error finder',
    'minify json string compact',
    'json tree viewer interactive',
    'format json with 2 spaces 4 spaces tabs',
    'developer json formatting tool',
  ],
  'base64-encoder-decoder': [
    'base64 encoder decoder online free',
    'base64 to image converter',
    'image to base64 data url generator',
    'encode string to base64 utf8',
    'decode base64 to text file',
    'data uri base64 generator for css html',
    'fast client side base64 tool',
  ],
  'markdown-preview': [
    'markdown preview live editor',
    'github flavored markdown live viewer',
    'markdown to html converter online',
    'markdown table and task list editor',
    'side by side md markdown previewer',
    'export markdown to html file',
    'free markdown writing tool',
  ],
  'json-to-csv': [
    'json to csv converter online free',
    'convert json to excel spreadsheet',
    'flatten nested json to csv table',
    'export json array to csv download',
    'json parser to comma separated values',
    'developer json data to csv exporter',
  ],
  'age-calculator': [
    'age calculator from date of birth',
    'calculate exact age in years months days',
    'chronological age calculator online',
    'how old am i in days hours minutes',
    'birthday countdown calculator',
    'next birthday day of the week',
  ],
  'percentage-calculator': [
    'percentage calculator online free',
    'calculate percentage increase decrease',
    'what is x percent of y calculator',
    'percentage difference between two numbers',
    'discount percentage calculator step by step',
    'sales tax and tip percentage formula',
  ],
  'bmi-calculator': [
    'bmi calculator body mass index',
    'calculate bmi online metric and imperial',
    'healthy weight range calculator',
    'adult bmi category chart underweight normal overweight',
    'kg cm lbs feet inches bmi tool',
  ],
  'video-to-audio': [
    'video to audio converter online free',
    'extract audio from video mp4 to mp3',
    'video soundtrack extractor in browser',
    'extract mp3 wav from video file',
    'no upload video audio converter',
    'strip audio from movie video memo',
  ],
  'image-to-pdf': [
    'image to pdf converter online free',
    'combine photos into one pdf album',
    'convert jpg png webp to pdf document',
    'batch photos to pdf with reordering',
    'pictures to pdf presentation portfolio',
    'client side image to pdf maker',
  ],
  'meta-tags-generator': [
    'meta tags generator for seo',
    'open graph og tags generator facebook linkedin',
    'twitter card generator summary_large_image',
    'seo meta description and title generator',
    'social media link preview generator',
    'html head meta tags copy paste',
  ],
  'utm-builder': [
    'utm builder campaign url creator',
    'google analytics 4 utm tag generator',
    'utm source medium campaign term content',
    'marketing tracking link builder',
    'clean campaign url builder for ads email',
  ],
  'ai-upscaler': [
    'ai image upscaler online free',
    'super resolution ai photo enhancer',
    'upscale image 2x 4x without losing quality',
    'fix blurry photo ai enhancer',
    'enhance pixel resolution online',
    'onnx super resolution browser',
    'free ai image upscaler no upload',
  ],
  'smart-scanner': [
    'smart document scanner online',
    'perspective warp unskew receipt',
    'flatten document photo taken at angle',
    'extract text from image ocr tesseract',
    'camera scan to pdf free online',
    'document edge detection and flattening',
    'free client side mobile document scanner',
  ],
  'trimmer': [
    'visual video trimmer online free',
    'trim video and convert to gif',
    'mp4 cutter with visual timeline',
    'browser video trimmer no watermark',
    'video to animated gif converter hd',
    'clip mp4 scene online fast',
    'client side ffmpeg video trimmer',
  ],
  'ai-summarizer': [
    'on device ai text summarizer',
    'summarize article private offline ai',
    'transformers js text summarization',
    'bullet point summary generator free',
    'distilbart ai text condenser',
    'free ai essay summarizer no sign up',
    'zero cloud private ai summarizer',
  ],
  'svg-vectorizer': [
    'raster to svg vectorizer online free',
    'convert jpg png to svg vector',
    'logo vector tracer potrace online',
    'infinite zoom vector logo generator',
    'convert sketch to svg paths',
    'image to vector converter no upload',
    'browser based svg vectorizer',
  ],
  'magic-eraser': [
    'remove object from photo free',
    'erase person from picture',
    'ai magic eraser online',
    'remove unwanted objects from photos',
    'content aware fill free',
    'photo object remover',
    'remove text from image',
    'clean up photo background',
  ],
  'colorize-photo': [
    'colorize black and white photo free',
    'add color to old photo',
    'ai photo colorizer online',
    'black and white to color converter',
    'restore old photos color',
    'colorize vintage photos',
    'ai color old pictures',
  ],
  'passport-photo': [
    'free passport photo maker online',
    'make passport photo at home',
    'passport photo generator free',
    'id photo maker',
    'visa photo creator online',
    'passport size photo app',
    'print passport photo 4x6',
    'us passport photo free',
    'uk passport photo maker',
    'india passport photo size',
  ],
  'voice-changer': [
    'voice changer online free',
    'real time voice changer',
    'change voice to robot online',
    'deep voice changer free',
    'chipmunk voice effect online',
    'voice disguiser online',
    'fun voice effects',
    'record changed voice',
    'voice changer no download',
  ],
  'noise-remover': [
    'remove background noise from audio free',
    'clean up audio recording online',
    'ai noise remover',
    'remove wind noise from video',
    'podcast noise reduction free',
    'audio noise cleaner online',
    'reduce background noise in recording',
    'denoise audio free',
    'remove fan noise from audio',
  ],
};

// Build highly targeted metadata for individual tools
export function buildToolMetadata(slug: string): Metadata {
  const tool = getToolBySlug(slug);
  if (!tool) {
    return {
      title: 'Free Online Tool — Fast & Private | MultiZest',
      description: 'Free, fast, and secure browser-based tool with zero server uploads.',
    };
  }

  // Exact SEO & Intent-Driven Keyword Matrix for V5 & V6 Advanced Tools
  const INTENT_SEO_MAP: Record<string, { title: string; description: string; lsi: string[] }> = {
    'ai-upscaler': {
      title: 'Unblur Image Free Online — Make Blurry Photos Crystal Clear | MultiZest',
      description: 'Unblur image free online with AI. Enhance photo resolution, fix blurry pictures, and make picture clear in your browser with 100% privacy.',
      lsi: ['unblur image free online', 'enhance photo resolution', 'fix blurry pictures', 'ai image upscaler', 'make picture clear'],
    },
    'smart-scanner': {
      title: 'Extract Text from Image — Picture-to-Text Scanner Online | MultiZest',
      description: 'Extract text from image free online. Photo to text converter & online receipt scanner to convert handwriting and paper documents to clean copyable text.',
      lsi: ['extract text from image', 'photo to text converter', 'online receipt scanner', 'convert handwriting to text'],
    },
    'trimmer': {
      title: 'Cut Video Online Free — Quick Video Cutter & GIF Maker | MultiZest',
      description: 'Cut video online free with no watermark. Fast MP4 trimmer to crop video length and make animated GIFs directly in your browser.',
      lsi: ['cut video online free', 'mp4 trimmer no watermark', 'crop video length', 'make gif from video'],
    },
    'ai-summarizer': {
      title: 'TLDR Generator & Summarizer — AI Article & Essay Shortener | MultiZest',
      description: 'TLDR generator and AI summarizer. Summarize article AI, long text shortener, and make essay shorter directly in your browser with zero cloud uploads.',
      lsi: ['tldr generator & summarizer', 'summarize article ai', 'long text shortener', 'make essay shorter'],
    },
    'svg-vectorizer': {
      title: 'Convert Image to SVG Vector — Free Logo & Image Vectorizer | MultiZest',
      description: 'Convert image to SVG vector online free. Convert JPG to SVG transparent, auto trace image, and vectorize logo free in your browser.',
      lsi: ['convert image to svg vector', 'jpg to svg transparent', 'auto trace image', 'vectorize logo free'],
    },
    'magic-eraser': {
      title: 'Remove Objects from Photos Free — AI Magic Eraser | MultiZest',
      description: 'Erase unwanted people, wires, text, or objects from any photo using AI. 100% free, no sign-up, works in your browser. Your photos stay private.',
      lsi: [
        'remove object from photo free',
        'erase person from picture',
        'ai magic eraser online',
        'remove unwanted objects from photos',
        'content aware fill free',
        'photo object remover',
        'remove text from image',
        'clean up photo background',
      ],
    },
    'colorize-photo': {
      title: 'Colorize Black & White Photos Free — AI Photo Colorizer | MultiZest',
      description: 'Add realistic colors to old black and white photos using AI. Free, instant, no sign-up. Bring your family memories to life in seconds.',
      lsi: [
        'colorize black and white photo free',
        'add color to old photo',
        'ai photo colorizer online',
        'black and white to color converter',
        'restore old photos color',
        'colorize vintage photos',
        'ai color old pictures',
      ],
    },
    'passport-photo': {
      title: 'Free Passport Photo Maker — Create ID Photos Online | MultiZest',
      description: 'Make passport photos at home for free! AI auto-crops, removes background, and creates a printable sheet. Supports US, UK, India, EU, Canada & more.',
      lsi: [
        'free passport photo maker online',
        'make passport photo at home',
        'passport photo generator free',
        'id photo maker',
        'visa photo creator online',
        'passport size photo app',
        'print passport photo 4x6',
        'us passport photo free',
        'uk passport photo maker',
        'india passport photo size',
      ],
    },
    'voice-changer': {
      title: 'Free Real-Time Voice Changer Online — Robot, Deep, Chipmunk | MultiZest',
      description: 'Change your voice in real-time with fun effects: Robot, Deep Voice, Chipmunk, Echo, Ghost & more. Record and download. Free, no app needed!',
      lsi: [
        'voice changer online free',
        'real time voice changer',
        'change voice to robot online',
        'deep voice changer free',
        'chipmunk voice effect online',
        'voice disguiser online',
        'fun voice effects',
        'record changed voice',
        'voice changer no download',
      ],
    },
    'noise-remover': {
      title: 'Remove Background Noise from Audio Free — AI Noise Remover | MultiZest',
      description: 'Clean up noisy audio recordings instantly. Remove wind, fan, traffic, and background noise from podcasts, voice memos & videos. Free, no sign-up.',
      lsi: [
        'remove background noise from audio free',
        'clean up audio recording online',
        'ai noise remover',
        'remove wind noise from video',
        'podcast noise reduction free',
        'audio noise cleaner online',
        'reduce background noise in recording',
        'denoise audio free',
        'remove fan noise from audio',
      ],
    },
  };

  const intentConfig = INTENT_SEO_MAP[slug];

  const toolKeywords = TOOL_KEYWORDS_MAP[slug] || [];
  const baseKeywords = intentConfig
    ? intentConfig.lsi
    : [
        tool.name.toLowerCase(),
        `${tool.name.toLowerCase()} online free`,
        `${tool.name.toLowerCase()} no upload`,
        `${tool.name.toLowerCase()} browser tool`,
        tool.categoryName.toLowerCase(),
        'free online tools',
        'client side privacy',
        'no file upload',
        'multizest',
      ];
  const combinedKeywords = Array.from(new Set([...toolKeywords, ...baseKeywords]));

  const ogImageUrl = `/api/og?title=${encodeURIComponent(intentConfig ? intentConfig.title.split(' — ')[0] : tool.name)}&category=${encodeURIComponent(tool.categoryName)}&desc=${encodeURIComponent(intentConfig ? intentConfig.description : tool.shortDescription)}`;
  const canonicalUrl = tool.path ? `${SITE_CONFIG.url}${tool.path}` : `${SITE_CONFIG.url}/tools/${tool.slug}`;

  // Formulate high-CTR, search-intent title
  const optimizedTitle = intentConfig
    ? intentConfig.title
    : `${tool.name} — Free Online Tool (100% Private, No Upload) | MultiZest`;
  const optimizedDescription = intentConfig
    ? intentConfig.description
    : `${tool.shortDescription} Fast, 100% private in-browser processing with zero server uploads and no account required.`;

  return {
    title: optimizedTitle,
    description: optimizedDescription,
    keywords: combinedKeywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: optimizedTitle,
      description: optimizedDescription,
      url: canonicalUrl,
      siteName: SITE_CONFIG.name,
      locale: 'en_US',
      type: 'website',
      images: [
        {
          url: `${SITE_CONFIG.url}${ogImageUrl}`,
          width: 1200,
          height: 630,
          alt: `${tool.name} — MultiZest Free Online Tool`,
          type: 'image/png',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: optimizedTitle,
      description: optimizedDescription,
      creator: SITE_CONFIG.twitterHandle,
      images: [`${SITE_CONFIG.url}${ogImageUrl}`],
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
    category: tool.categoryName,
  };
}

// Generate WebSite Schema with Site Search potentialAction
export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_CONFIG.name,
    headline: SITE_CONFIG.tagline,
    url: SITE_CONFIG.url,
    description: SITE_CONFIG.description,
    inLanguage: 'en-US',
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
      logo: `${SITE_CONFIG.url}/images/logo.svg`,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_CONFIG.url}/tools?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

// Generate Organization Schema
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_CONFIG.name,
    legalName: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    logo: `${SITE_CONFIG.url}/images/logo.svg`,
    description: SITE_CONFIG.description,
    email: SITE_CONFIG.contactEmail,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      email: SITE_CONFIG.contactEmail,
      availableLanguage: ['English'],
    },
    knowsAbout: [
      'PDF Conversion and Merging',
      'Image Compression and Optimization',
      'Client-Side Web Development',
      'Text Analytics and Word Counting',
      'QR Code Generation',
      'Privacy-First Browser Computing',
    ],
    sameAs: [],
  };
}

// Generate WebApplication Schema
export function generateWebApplicationSchema(tool: ToolItem) {
  const ratingValue = (tool.rating || 4.9).toFixed(1);
  const ratingCount = tool.ratingCount || 1240;

  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: `${tool.name} — MultiZest`,
    applicationCategory: 'UtilityApplication',
    applicationSubCategory: tool.categoryName,
    operatingSystem: 'All',
    browserRequirements:
      'Requires JavaScript and HTML5 Canvas. Supported on all modern browsers (Chrome, Firefox, Safari, Edge).',
    description: tool.shortDescription,
    url: `${SITE_CONFIG.url}/tools/${tool.slug}`,
    inLanguage: 'en-US',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: ratingValue,
      reviewCount: ratingCount,
      bestRating: '5',
      worstRating: '1',
    },
    featureList: tool.features.join(', '),
    softwareVersion: '3.2.0',
    creator: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
    },
  };
}

// Generate SoftwareApplication Schema
export function generateAggregateRatingSchema(tool: ToolItem) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.name,
    operatingSystem: 'All',
    applicationCategory: 'BrowserApplication',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: (tool.rating || 4.9).toFixed(1),
      ratingCount: tool.ratingCount || 1240,
      bestRating: '5',
      worstRating: '1',
    },
  };
}

// Generate Tool Breadcrumb Schema
export function generateToolBreadcrumbSchema(tool: ToolItem) {
  return generateBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: 'Tools', item: '/tools' },
    { name: tool.categoryName, item: `/categories/${tool.category}` },
    { name: tool.name, item: `/tools/${tool.slug}` },
  ]);
}

// Generate Category Breadcrumb Schema
export function generateCategoryBreadcrumbSchema(category: CategoryInfo) {
  return generateBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: 'Tools', item: '/tools' },
    { name: category.name, item: `/categories/${category.slug}` },
  ]);
}

// Generate FAQ Schema for SERP expandable rich snippets
export function generateFAQSchema(faqs: ToolFAQ[] = []) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: (faqs || []).map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

// Generate HowTo Schema for step-by-step tutorials
export function generateHowToSchema(tool: ToolItem) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `How to Use the ${tool.name}`,
    description: tool.longDescription,
    totalTime: 'PT1M',
    step: tool.howToSteps.map((step, idx) => ({
      '@type': 'HowToStep',
      position: idx + 1,
      name: step.title,
      text: step.description,
      url: `${SITE_CONFIG.url}/tools/${tool.slug}#step-${idx + 1}`,
    })),
  };
}

// Generate Breadcrumb Schema
export function generateBreadcrumbSchema(items: { name: string; item: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((crumb, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: crumb.name,
      item: crumb.item.startsWith('http') ? crumb.item : `${SITE_CONFIG.url}${crumb.item}`,
    })),
  };
}

// Generate Category Collection Schema (ItemList)
export function generateCategoryCollectionSchema(category: CategoryInfo, tools: ToolItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${category.name} — MultiZest`,
    description: category.description,
    url: `${SITE_CONFIG.url}/categories/${category.slug}`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: tools.length,
      itemListElement: tools.map((tool, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        url: `${SITE_CONFIG.url}/tools/${tool.slug}`,
        name: tool.name,
        description: tool.shortDescription,
      })),
    },
  };
}

// Generate SiteNavigationElement Schema for rich Google Sitelinks
export function generateSiteNavigationSchema() {
  const mainNavigation = [
    { name: 'All Tools', url: `${SITE_CONFIG.url}/tools` },
    { name: 'PDF Tools', url: `${SITE_CONFIG.url}/categories/pdf-tools` },
    { name: 'Image Tools', url: `${SITE_CONFIG.url}/categories/image-tools` },
    { name: 'Text Tools', url: `${SITE_CONFIG.url}/categories/text-tools` },
    { name: 'Developer Tools', url: `${SITE_CONFIG.url}/categories/developer-tools` },
    { name: 'Generator Tools', url: `${SITE_CONFIG.url}/categories/generator-tools` },
    { name: 'Calculator Tools', url: `${SITE_CONFIG.url}/categories/calculator-tools` },
    { name: 'Blog & Tutorials', url: `${SITE_CONFIG.url}/blog` },
  ];

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: mainNavigation.map((item, idx) => ({
      '@type': 'SiteNavigationElement',
      position: idx + 1,
      name: item.name,
      url: item.url,
    })),
  };
}

// Generate Article Schema for Blog Posts
export function generateArticleSchema(post: BlogPost) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      '@type': 'Organization',
      name: post.author.name,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_CONFIG.url}/images/logo.svg`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_CONFIG.url}/blog/${post.slug}`,
    },
  };
}
