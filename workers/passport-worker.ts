// TypeScript Web Worker wrapper for Passport Photo Maker
export type PassportMessage =
  | {
      type: 'process';
      imageBuffer: ArrayBuffer;
      width: number;
      height: number;
      targetWidthPx: number;
      targetHeightPx: number;
      headRatio: [number, number];
      countryName: string;
    }
  | { type: 'progress'; step: number; text: string; pct: number }
  | {
      type: 'result';
      singleBuffer: ArrayBuffer;
      singleWidth: number;
      singleHeight: number;
      sheetBuffer: ArrayBuffer;
      sheetWidth: number;
      sheetHeight: number;
      totalCopies: number;
    }
  | { type: 'error'; code: string; message: string };

export const PASSPORT_WORKER_PATH = '/workers/passport.worker.js';
