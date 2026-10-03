/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  UploadCloud,
  Download,
  RotateCcw,
  Sparkles,
  Play,
  Pause,
  Film,
  Video,
  Scissors,
  CheckCircle2,
  Clock,
  Settings,
  ChevronLeft,
  ChevronRight,
  FileVideo,
  Image as ImageIcon,
} from 'lucide-react';
import { fireSuccessConfetti } from '@/lib/confetti';

export default function VideoTrimmerTool() {
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('video');
  const [duration, setDuration] = useState(0);

  // Trimming handles (in seconds)
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(5);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Timeline thumbnail filmstrip
  const [thumbnails, setThumbnails] = useState<string[]>([]);

  // GIF settings
  const [gifFps, setGifFps] = useState<10 | 15 | 24>(15);
  const [gifWidth, setGifWidth] = useState<320 | 480 | 640>(480);

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processProgress, setProcessProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [outputType, setOutputType] = useState<'video' | 'gif' | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [friendlyAlert, setFriendlyAlert] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms}`;
  };

  const handleFileUpload = (file: File) => {
    setFriendlyAlert(null);
    // Strict 100MB Memory Crash Prevention Guard with Friendly Warning
    if (file.size > 100 * 1024 * 1024) {
      setFriendlyAlert('Oops! That video is a bit too heavy for your browser to carry. Could you try a video under 100MB?');
      return;
    }

    setFileName(file.name.replace(/\.[^/.]+$/, ''));
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoSrc(url);
    setOutputUrl(null);
    setOutputType(null);
  };

  const cancelProcessing = () => {
    setIsProcessing(false);
    setProcessProgress(0);
    setStatusMessage('Canceled.');
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    }
  };

  const handleVideoLoaded = () => {
    const v = videoRef.current;
    if (!v) return;
    const dur = v.duration || 10;
    setDuration(dur);
    setStartTime(0);
    setEndTime(Math.min(dur, Math.max(2, dur * 0.4)));
    generateThumbnailStrip(v, dur);
  };

  // Generate visual filmstrip thumbnails
  const generateThumbnailStrip = async (video: HTMLVideoElement, totalDur: number) => {
    try {
      const thumbs: string[] = [];
      const count = 8;
      const offscreenVideo = document.createElement('video');
      offscreenVideo.crossOrigin = 'anonymous';
      offscreenVideo.src = video.src;
      offscreenVideo.muted = true;

      await new Promise((r) => {
        offscreenVideo.onloadedmetadata = r;
      });

      const canvas = document.createElement('canvas');
      canvas.width = 120;
      canvas.height = 68;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      for (let i = 0; i < count; i++) {
        const timeTarget = (totalDur / count) * i;
        offscreenVideo.currentTime = timeTarget;
        await new Promise((r) => {
          offscreenVideo.onseeked = r;
        });
        ctx.drawImage(offscreenVideo, 0, 0, canvas.width, canvas.height);
        thumbs.push(canvas.toDataURL('image/jpeg', 0.6));
      }
      setThumbnails(thumbs);
    } catch (e) {
      console.warn('Could not generate filmstrip thumbnails:', e);
    }
  };

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (isPlaying) {
      v.pause();
      setIsPlaying(false);
    } else {
      if (v.currentTime < startTime || v.currentTime >= endTime) {
        v.currentTime = startTime;
      }
      v.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v) return;
    setCurrentTime(v.currentTime);

    // Loop within selection
    if (v.currentTime >= endTime) {
      v.currentTime = startTime;
    }
  };

  const stepTime = (delta: number) => {
    const v = videoRef.current;
    if (!v) return;
    const target = Math.max(0, Math.min(duration, v.currentTime + delta));
    v.currentTime = target;
    setCurrentTime(target);
  };

  // Convert Selection to Animated GIF
  const exportAsGif = async () => {
    if (!videoRef.current) return;
    setIsProcessing(true);
    setOutputType('gif');
    setStatusMessage('Capturing frames for animated GIF...');
    setProcessProgress(15);

    try {
      // Dynamic import of gifshot for smooth bundling
      const gifshot = (await import('gifshot')).default;
      const selectDur = endTime - startTime;
      const totalFrames = Math.round(selectDur * gifFps);
      const interval = 1 / gifFps;

      const offVideo = document.createElement('video');
      offVideo.src = videoRef.current.src;
      offVideo.crossOrigin = 'anonymous';
      offVideo.muted = true;

      await new Promise((r) => {
        offVideo.onloadedmetadata = r;
      });

      const canvas = document.createElement('canvas');
      const aspect = offVideo.videoHeight / offVideo.videoWidth || 0.5625;
      canvas.width = gifWidth;
      canvas.height = Math.round(gifWidth * aspect);
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas 2D unavailable');

      const capturedImages: string[] = [];

      for (let i = 0; i < totalFrames; i++) {
        const t = startTime + i * interval;
        if (t > endTime) break;
        offVideo.currentTime = t;
        await new Promise((r) => {
          offVideo.onseeked = r;
        });

        ctx.drawImage(offVideo, 0, 0, canvas.width, canvas.height);
        capturedImages.push(canvas.toDataURL('image/png'));
        const p = Math.round(15 + (i / totalFrames) * 45);
        setProcessProgress(p);
      }

      setStatusMessage('Encoding GIF color palette & dithering...');
      setProcessProgress(65);

      gifshot.createGIF(
        {
          images: capturedImages,
          gifWidth,
          gifHeight: canvas.height,
          interval,
          numWorkers: 2,
          progressCallback: (captureProgress: number) => {
            setProcessProgress(Math.round(65 + captureProgress * 30));
          },
        },
        (obj: { error: boolean; image: string; errorMsg?: string }) => {
          if (!obj.error) {
            setOutputUrl(obj.image);
            setIsProcessing(false);
            setProcessProgress(100);
            setStatusMessage('GIF ready!');
            fireSuccessConfetti();
          } else {
            throw new Error(obj.errorMsg || 'GIF generation failed');
          }
        }
      );
    } catch (err) {
      console.error('GIF generation error:', err);
      setIsProcessing(false);
      setStatusMessage('GIF generation failed.');
    }
  };

  // Save as Trimmed Video (Client-side MediaRecorder capture)
  const exportAsTrimmedVideo = async () => {
    if (!videoRef.current) return;
    setIsProcessing(true);
    setOutputType('video');
    setStatusMessage('Trimming video frames...');
    setProcessProgress(20);

    try {
      const v = videoRef.current;
      v.pause();
      setIsPlaying(false);
      v.currentTime = startTime;

      await new Promise((r) => setTimeout(r, 200));

      // Use captureStream on video element
      // @ts-ignore
      const stream = v.captureStream ? v.captureStream(30) : (v as any).mozCaptureStream?.(30);

      if (!stream) {
        throw new Error('MediaStream capture not supported in this browser.');
      }

      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
          ? 'video/webm;codecs=vp9'
          : 'video/webm',
      });

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setOutputUrl(url);
        setIsProcessing(false);
        setProcessProgress(100);
        setStatusMessage('Trimmed video ready!');
        fireSuccessConfetti();
      };

      recorderRef.current = recorder;
      recorder.start();
      v.play();

      const trimDurationMs = (endTime - startTime) * 1000;
      const startTimeStamp = Date.now();

      const checkInterval = setInterval(() => {
        const elapsed = Date.now() - startTimeStamp;
        const p = Math.min(95, Math.round(20 + (elapsed / trimDurationMs) * 75));
        setProcessProgress(p);

        if (v.currentTime >= endTime || elapsed >= trimDurationMs + 200) {
          clearInterval(checkInterval);
          v.pause();
          recorder.stop();
        }
      }, 100);
    } catch (err) {
      console.error('Video trimming error:', err);
      setIsProcessing(false);
      setStatusMessage('Trim failed. You can export as animated GIF.');
    }
  };

  const handleDownload = () => {
    if (!outputUrl) return;
    const a = document.createElement('a');
    a.href = outputUrl;
    a.download = `${fileName}-trimmed.${outputType === 'gif' ? 'gif' : 'webm'}`;
    a.click();
  };

  const handleReset = () => {
    setVideoSrc(null);
    setVideoFile(null);
    setOutputUrl(null);
    setThumbnails([]);
    setIsPlaying(false);
    setIsProcessing(false);
  };

  return (
    <div className="space-y-6">
      {friendlyAlert && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 text-xs sm:text-sm">
          <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>{friendlyAlert}</span>
        </div>
      )}

      {!videoSrc ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
          }}
          onClick={() => fileInputRef.current?.click()}
          className="border-3 border-dashed border-rose-400 dark:border-rose-600 rounded-3xl p-10 sm:p-16 text-center cursor-pointer bg-rose-50/40 dark:bg-rose-950/20 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all group duration-200"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            accept="video/mp4,video/webm,video/quicktime"
            className="hidden"
          />
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-rose-600 to-red-600 text-white flex items-center justify-center mx-auto mb-5 shadow-lg shadow-rose-500/25 group-hover:scale-110 transition-transform">
            <Video className="w-10 h-10" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-rose-600" />
            <span>Dual Handle Timeline & GIF Converter</span>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Upload MP4, WebM, or MOV video
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-5">
            Trim precise scenes with millisecond accuracy or convert funny reactions and clips into high-quality GIFs.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold shadow-md transition-colors">
              <UploadCloud className="w-4 h-4" />
              <span>Select Video File</span>
            </span>
            <span className="text-xs text-slate-400">Max 100MB limit</span>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Video Viewport & Controls */}
          <div className="relative w-full rounded-3xl overflow-hidden bg-black aspect-video max-h-[460px] flex items-center justify-center shadow-2xl">
            <video
              ref={videoRef}
              src={videoSrc}
              onLoadedMetadata={handleVideoLoaded}
              onTimeUpdate={handleTimeUpdate}
              onClick={togglePlay}
              className="max-h-full max-w-full object-contain cursor-pointer"
            />
            {/* Center Play Overlay */}
            {!isPlaying && (
              <button
                type="button"
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors group"
              >
                <div className="w-16 h-16 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                  <Play className="w-8 h-8 ml-1" />
                </div>
              </button>
            )}
          </div>

          {/* Precision Timeline Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            {/* Timeline Filmstrip & Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                  <Scissors className="w-3.5 h-3.5" />
                  <span>Start: <strong>{formatTime(startTime)}</strong></span>
                </span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  Selected Duration: <strong>{(endTime - startTime).toFixed(1)}s</strong>
                </span>
                <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                  <span>End: <strong>{formatTime(endTime)}</strong></span>
                </span>
              </div>

              {/* Visual Filmstrip container with range sliders */}
              <div className="relative w-full h-16 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center">
                {/* Thumbnails strip */}
                <div className="absolute inset-0 flex">
                  {thumbnails.length > 0 ? (
                    thumbnails.map((thumb, idx) => (
                      <div key={idx} className="flex-1 h-full overflow-hidden border-r border-black/30 opacity-70">
                        <img src={thumb} alt={`frame ${idx}`} className="w-full h-full object-cover" />
                      </div>
                    ))
                  ) : (
                    <div className="w-full h-full bg-slate-900 flex items-center justify-center text-xs text-slate-500">
                      Generating video filmstrip...
                    </div>
                  )}
                </div>

                {/* Selected Segment Highlight Box */}
                <div
                  className="absolute top-0 bottom-0 bg-rose-500/30 border-y-2 border-rose-500 pointer-events-none"
                  style={{
                    left: `${(startTime / duration) * 100}%`,
                    width: `${((endTime - startTime) / duration) * 100}%`,
                  }}
                />

                {/* Current Playhead */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-white shadow-lg pointer-events-none z-10"
                  style={{ left: `${(currentTime / duration) * 100}%` }}
                />
              </div>

              {/* Dual Range Controls */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                    <span>Trim Start Time</span>
                    <span className="font-mono font-bold text-rose-600">{formatTime(startTime)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={duration || 10}
                    step="0.1"
                    value={startTime}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (val < endTime) {
                        setStartTime(val);
                        if (videoRef.current) videoRef.current.currentTime = val;
                      }
                    }}
                    className="w-full accent-rose-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                    <span>Trim End Time</span>
                    <span className="font-mono font-bold text-rose-600">{formatTime(endTime)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={duration || 10}
                    step="0.1"
                    value={endTime}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (val > startTime) {
                        setEndTime(val);
                        if (videoRef.current) videoRef.current.currentTime = val;
                      }
                    }}
                    className="w-full accent-rose-600 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Playback Controls & Frame Stepping */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => stepTime(-1)}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold"
                  title="Step -1s"
                >
                  -1s
                </button>
                <button
                  type="button"
                  onClick={() => stepTime(-0.1)}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Step -0.1s"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={togglePlay}
                  className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold flex items-center gap-1.5"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                  <span>{isPlaying ? 'Pause' : 'Play Clip'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => stepTime(0.1)}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Step +0.1s"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => stepTime(1)}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold"
                  title="Step +1s"
                >
                  +1s
                </button>
              </div>

              {/* GIF Settings Panel */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">FPS:</span>
                  <select
                    value={gifFps}
                    onChange={(e) => setGifFps(Number(e.target.value) as typeof gifFps)}
                    className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value={10}>10 FPS (Compact)</option>
                    <option value={15}>15 FPS (Smooth)</option>
                    <option value={24}>24 FPS (Cinematic)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Width:</span>
                  <select
                    value={gifWidth}
                    onChange={(e) => setGifWidth(Number(e.target.value) as typeof gifWidth)}
                    className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value={320}>320px (Mobile)</option>
                    <option value={480}>480px (Standard)</option>
                    <option value={640}>640px (HD)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Action Export Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Upload New Video</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={exportAsTrimmedVideo}
                  disabled={isProcessing}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-700 dark:text-rose-300 text-xs sm:text-sm font-bold transition-all disabled:opacity-50"
                >
                  <FileVideo className="w-4 h-4" />
                  <span>Save Trimmed Video</span>
                </button>

                <button
                  type="button"
                  onClick={exportAsGif}
                  disabled={isProcessing}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-rose-500/20 active:scale-95 transition-all disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Convert to Animated GIF</span>
                </button>
              </div>
            </div>
          </div>

          {/* Processing Progress Bar */}
          {isProcessing && (
            <div className="p-6 rounded-3xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 space-y-3">
              <div className="flex justify-between items-center text-sm font-semibold text-rose-900 dark:text-rose-200">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 animate-spin text-rose-600" />
                  {statusMessage}
                </span>
                <div className="flex items-center gap-3">
                  <span className="font-mono">{processProgress}%</span>
                  <button
                    type="button"
                    onClick={cancelProcessing}
                    className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-semibold px-2.5 py-1 rounded-lg border border-rose-200 hover:bg-rose-100 dark:border-rose-800 dark:hover:bg-rose-950/60 transition-colors"
                  >
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
              <div className="w-full h-3 rounded-full bg-rose-200/60 dark:bg-rose-900 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-rose-600 to-red-600 transition-all duration-300 rounded-full"
                  style={{ width: `${processProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Output Display Card */}
          {outputUrl && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span>Generated {outputType === 'gif' ? 'Animated GIF' : 'Trimmed Video'}</span>
                </h4>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold shadow-md transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Download {outputType === 'gif' ? '.GIF' : '.WEBM'}</span>
                </button>
              </div>

              <div className="flex justify-center p-4 bg-slate-950 rounded-2xl overflow-hidden max-h-[400px]">
                {outputType === 'gif' ? (
                  <img src={outputUrl} alt="Exported GIF" className="max-h-full object-contain rounded-lg" />
                ) : (
                  <video src={outputUrl} controls autoPlay loop className="max-h-full object-contain rounded-lg" />
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
