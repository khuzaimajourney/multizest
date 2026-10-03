export interface VoiceEffectPreset {
  id: string;
  name: string;
  icon: string;
  description: string;
  tag: string;
  biquadType?: BiquadFilterType;
  biquadFreq?: number;
  biquadQ?: number;
  biquadGain?: number;
  distortion?: number;
  oscillatorFreq?: number;
  delayTime?: number;
  feedback?: number;
  gain?: number;
  pitchShift?: number; // Simulated semitone playback/filter resonance
}

export const voiceEffects: Record<string, VoiceEffectPreset> = {
  robot: {
    id: 'robot',
    name: 'Robot',
    icon: '🤖',
    description: 'Metallic, mechanical cybernetic voice',
    tag: 'Sci-Fi Classic',
    oscillatorFreq: 50, // Ring modulator modulation frequency in Hz
    distortion: 400,
    biquadType: 'lowpass',
    biquadFreq: 3000,
    biquadQ: 10,
    gain: 1.2,
  },
  deep: {
    id: 'deep',
    name: 'Deep / Villain',
    icon: '👹',
    description: 'Deep, intimidating movie villain resonance',
    tag: 'Intimidating',
    pitchShift: -8,
    biquadType: 'lowpass',
    biquadFreq: 750,
    biquadQ: 2,
    gain: 1.6,
  },
  chipmunk: {
    id: 'chipmunk',
    name: 'Chipmunk',
    icon: '🐿️',
    description: 'High-pitched, squeaky playful voice',
    tag: 'Cute & Funny',
    pitchShift: 10,
    biquadType: 'highpass',
    biquadFreq: 600,
    biquadQ: 4,
    gain: 1.1,
  },
  echo: {
    id: 'echo',
    name: 'Echo / Cave',
    icon: '🏔️',
    description: 'Echoing, cavernous reverberant space',
    tag: 'Atmospheric',
    delayTime: 0.3, // seconds
    feedback: 0.52,
    biquadType: 'allpass',
    biquadFreq: 1100,
    gain: 1.0,
  },
  ghost: {
    id: 'ghost',
    name: 'Ghost / Whisper',
    icon: '👻',
    description: 'Eerie, whispering phantom resonance',
    tag: 'Spooky',
    pitchShift: -3,
    delayTime: 0.06,
    feedback: 0.72,
    biquadType: 'bandpass',
    biquadFreq: 1600,
    biquadQ: 6,
    gain: 0.85,
  },
  radio: {
    id: 'radio',
    name: 'Walkie-Talkie',
    icon: '📻',
    description: 'Gritty vintage radio and tactical comms',
    tag: 'Tactical Retro',
    biquadType: 'bandpass',
    biquadFreq: 2100,
    biquadQ: 8,
    distortion: 250,
    gain: 1.3,
  },
  alien: {
    id: 'alien',
    name: 'Alien',
    icon: '👽',
    description: 'Strange, otherworldly extraterrestrial frequency',
    tag: 'Interstellar',
    oscillatorFreq: 210, // Higher frequency ring modulation
    pitchShift: 5,
    biquadType: 'notch',
    biquadFreq: 1200,
    biquadQ: 3,
    gain: 1.15,
  },
  telephone: {
    id: 'telephone',
    name: 'Old Telephone',
    icon: '📞',
    description: 'Classic landline telephone receiver sound',
    tag: 'Lo-Fi Vintage',
    biquadType: 'bandpass',
    biquadFreq: 2600,
    biquadQ: 11,
    gain: 1.25,
  },
};

export type VoiceEffectKey = keyof typeof voiceEffects;
