export interface PassportSizeConfig {
  name: string;
  country: string;
  flag: string;
  width: number;
  height: number;
  unit: 'inches' | 'mm';
  dpi: number;
  bgColor: string;
  headRatio: [number, number]; // [minHeadRatio, maxHeadRatio]
  description: string;
}

export const passportSizes: Record<string, PassportSizeConfig> = {
  'us-passport': {
    name: 'US Passport / Visa',
    country: 'United States',
    flag: '🇺🇸',
    width: 2,
    height: 2,
    unit: 'inches',
    dpi: 300,
    bgColor: '#FFFFFF',
    headRatio: [0.5, 0.69],
    description: '2×2 inches (51×51 mm) with head between 1 and 1 3/8 inches.',
  },
  'uk-passport': {
    name: 'UK Passport',
    country: 'United Kingdom',
    flag: '🇬🇧',
    width: 35,
    height: 45,
    unit: 'mm',
    dpi: 300,
    bgColor: '#FFFFFF',
    headRatio: [0.55, 0.75],
    description: '35×45 mm with head height between 29mm and 34mm.',
  },
  'india-passport': {
    name: 'India Passport',
    country: 'India',
    flag: '🇮🇳',
    width: 2,
    height: 2,
    unit: 'inches',
    dpi: 300,
    bgColor: '#FFFFFF',
    headRatio: [0.5, 0.7],
    description: '2×2 inches (51×51 mm) or 35×45 mm with white background.',
  },
  'eu-passport': {
    name: 'EU / Schengen Visa',
    country: 'European Union',
    flag: '🇪🇺',
    width: 35,
    height: 45,
    unit: 'mm',
    dpi: 300,
    bgColor: '#FFFFFF',
    headRatio: [0.5, 0.75],
    description: '35×45 mm standard ICAO biometric compliance.',
  },
  'canada-passport': {
    name: 'Canada Passport',
    country: 'Canada',
    flag: '🇨🇦',
    width: 50,
    height: 70,
    unit: 'mm',
    dpi: 300,
    bgColor: '#FFFFFF',
    headRatio: [0.55, 0.75],
    description: '50×70 mm (2×2 3/4 inches) with neutral expression.',
  },
  'pakistan-passport': {
    name: 'Pakistan Passport',
    country: 'Pakistan',
    flag: '🇵🇰',
    width: 35,
    height: 45,
    unit: 'mm',
    dpi: 300,
    bgColor: '#FFFFFF',
    headRatio: [0.5, 0.7],
    description: '35×45 mm with plain white background and full frontal face.',
  },
  'china-passport': {
    name: 'China Passport / Visa',
    country: 'China',
    flag: '🇨🇳',
    width: 33,
    height: 48,
    unit: 'mm',
    dpi: 300,
    bgColor: '#FFFFFF',
    headRatio: [0.55, 0.75],
    description: '33×48 mm standard Chinese travel document requirements.',
  },
  'australia-passport': {
    name: 'Australia Passport',
    country: 'Australia',
    flag: '🇦🇺',
    width: 35,
    height: 45,
    unit: 'mm',
    dpi: 300,
    bgColor: '#FFFFFF',
    headRatio: [0.55, 0.75],
    description: '35×45 mm high-contrast photo on white background.',
  },
  'custom': {
    name: 'Custom Dimensions',
    country: 'Custom',
    flag: '🌐',
    width: 35,
    height: 45,
    unit: 'mm',
    dpi: 300,
    bgColor: '#FFFFFF',
    headRatio: [0.5, 0.7],
    description: 'Set custom photo width and height specifications.',
  },
};

export type PassportCountryKey = keyof typeof passportSizes;

export function getPixelDimensions(config: PassportSizeConfig): { widthPx: number; heightPx: number } {
  if (config.unit === 'inches') {
    return {
      widthPx: Math.round(config.width * config.dpi),
      heightPx: Math.round(config.height * config.dpi),
    };
  }
  // 1 inch = 25.4 mm
  const mmToInches = 1 / 25.4;
  return {
    widthPx: Math.round(config.width * mmToInches * config.dpi),
    heightPx: Math.round(config.height * mmToInches * config.dpi),
  };
}
