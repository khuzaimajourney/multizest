// TypeScript Web Worker wrapper for Inpainting
export type InpaintingMessage =
  | { type: 'inpaint'; imageBuffer: ArrayBuffer; maskBuffer: ArrayBuffer; width: number; height: number }
  | { type: 'progress'; text: string; pct: number }
  | { type: 'result'; imageBuffer: ArrayBuffer; width: number; height: number }
  | { type: 'error'; code: string; message: string };

export const INPAINTING_WORKER_PATH = '/workers/inpainting.worker.js';
