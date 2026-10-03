declare module 'imagetracerjs' {
  export interface ImageTracerOptions {
    corsenabled?: boolean;
    ltres?: number;
    qtres?: number;
    pathomit?: number;
    rightangleenhance?: boolean;
    colorsampling?: number;
    numberofcolors?: number;
    mincolorratio?: number;
    colorquantcycles?: number;
    layering?: number;
    strokewidth?: number;
    linefilter?: boolean;
    scale?: number;
    roundcoords?: number;
    viewbox?: boolean;
    desc?: boolean;
    lcpr?: number;
    qcpr?: number;
    blurradius?: number;
    blurdelta?: number;
  }

  export function imageToSVG(
    url: string,
    callback: (svgString: string) => void,
    options?: ImageTracerOptions
  ): void;

  export function imagedataToSVG(
    imageData: ImageData,
    options?: ImageTracerOptions
  ): string;
}

declare module 'gifshot' {
  export interface GifshotOptions {
    video?: string[] | string;
    images?: (string | HTMLCanvasElement | ImageData)[];
    gifWidth?: number;
    gifHeight?: number;
    interval?: number;
    numFrames?: number;
    frameDuration?: number;
    sampleInterval?: number;
    numWorkers?: number;
    progressCallback?: (captureProgress: number) => void;
    completeCallback?: (obj: { error: boolean; errorCode?: string; errorMsg?: string; image: string }) => void;
  }

  export function createGIF(
    options: GifshotOptions,
    callback: (obj: { error: boolean; errorCode?: string; errorMsg?: string; image: string }) => void
  ): void;

  export function isSupported(): boolean;
}
