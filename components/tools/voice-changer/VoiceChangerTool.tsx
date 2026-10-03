'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Mic,
  MicOff,
  Radio,
  Volume2,
  Download,
  AlertCircle,
  Play,
  Pause,
  Headphones,
  Sparkles,
} from 'lucide-react';
import { voiceEffects, VoiceEffectKey } from '@/lib/audio-effects';
import { makeDistortionCurve, audioBufferToWav } from './AudioProcessorWorklet';

export default function VoiceChangerTool() {
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [selectedEffect, setSelectedEffect] = useState<VoiceEffectKey>('robot');
  const [volume, setVolume] = useState<number>(0.85);

  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [recordedDuration, setRecordedDuration] = useState<number>(0);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [isPlayingRecording, setIsPlayingRecording] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Web Audio Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);
  const waveShaperNodeRef = useRef<WaveShaperNode | null>(null);
  const delayNodeRef = useRef<DelayNode | null>(null);
  const feedbackNodeRef = useRef<GainNode | null>(null);
  const oscillatorNodeRef = useRef<OscillatorNode | null>(null);
  const oscGainNodeRef = useRef<GainNode | null>(null);
  const dryGainNodeRef = useRef<GainNode | null>(null);
  const ringGainNodeRef = useRef<GainNode | null>(null);
  const analyserNodeRef = useRef<AnalyserNode | null>(null);
  const streamDestRef = useRef<MediaStreamAudioDestinationNode | null>(null);

  // Recording
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Visualizer Canvas
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Setup Visualizer Canvas Loop
  const drawVisualizer = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserNodeRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animationFrameRef.current = requestAnimationFrame(render);
      analyser.getByteTimeDomainData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#3b82f6';
      ctx.beginPath();

      const sliceWidth = (canvas.width * 1.0) / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    render();
  }, []);

  // Update Audio Nodes for Selected Preset
  const applyEffectPreset = useCallback((effectKey: VoiceEffectKey) => {
    const ctx = audioContextRef.current;
    if (!ctx || !sourceNodeRef.current) return;

    const preset = voiceEffects[effectKey];

    // Configure BiquadFilter
    if (filterNodeRef.current && preset.biquadType) {
      filterNodeRef.current.type = preset.biquadType;
      filterNodeRef.current.frequency.setTargetAtTime(preset.biquadFreq || 1000, ctx.currentTime, 0.05);
      filterNodeRef.current.Q.setTargetAtTime(preset.biquadQ || 1, ctx.currentTime, 0.05);
    }

    // Configure Distortion WaveShaper
    if (waveShaperNodeRef.current) {
      if (preset.distortion) {
        waveShaperNodeRef.current.curve = makeDistortionCurve(preset.distortion) as Float32Array<ArrayBuffer>;
      } else {
        waveShaperNodeRef.current.curve = null;
      }
    }

    // Configure Delay & Feedback (Echo / Cave)
    if (delayNodeRef.current && feedbackNodeRef.current) {
      const delay = preset.delayTime || 0;
      delayNodeRef.current.delayTime.setTargetAtTime(delay, ctx.currentTime, 0.05);
      const feedback = preset.feedback || 0;
      feedbackNodeRef.current.gain.setTargetAtTime(feedback, ctx.currentTime, 0.05);
    }

    // Configure Ring Modulator and Dry path
    if (oscillatorNodeRef.current && ringGainNodeRef.current && dryGainNodeRef.current) {
      if (preset.oscillatorFreq) {
        oscillatorNodeRef.current.frequency.setTargetAtTime(preset.oscillatorFreq, ctx.currentTime, 0.05);
        dryGainNodeRef.current.gain.setTargetAtTime(0, ctx.currentTime, 0.05);
        ringGainNodeRef.current.gain.setTargetAtTime(1.0, ctx.currentTime, 0.05);
      } else {
        dryGainNodeRef.current.gain.setTargetAtTime(1.0, ctx.currentTime, 0.05);
        ringGainNodeRef.current.gain.setTargetAtTime(0, ctx.currentTime, 0.05);
      }
    }

    // Gain adjustment
    if (gainNodeRef.current) {
      const g = (preset.gain || 1.0) * volume;
      gainNodeRef.current.gain.setTargetAtTime(g, ctx.currentTime, 0.05);
    }
  }, [volume]);

  // Start Mic & Web Audio Graph
  const startAudio = async () => {
    setErrorMessage(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: false,
          autoGainControl: true,
        },
      });

      micStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      // Create Nodes
      const source = ctx.createMediaStreamSource(stream);
      sourceNodeRef.current = source;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      analyserNodeRef.current = analyser;

      const filter = ctx.createBiquadFilter();
      filterNodeRef.current = filter;

      const waveShaper = ctx.createWaveShaper();
      waveShaper.oversample = '4x';
      waveShaperNodeRef.current = waveShaper;

      // Dry and Ring Mod branches
      const dryGain = ctx.createGain();
      dryGain.gain.value = 1.0;
      dryGainNodeRef.current = dryGain;

      const ringGain = ctx.createGain();
      ringGain.gain.value = 0;
      ringGainNodeRef.current = ringGain;

      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 50;
      oscillatorNodeRef.current = osc;

      // Modulate ringGain
      osc.connect(ringGain.gain);
      try {
        osc.start();
      } catch {
        // already started
      }

      // PreMix node combines dry and ring modulated audio
      const preMix = ctx.createGain();
      preMix.gain.value = 1.0;

      const delay = ctx.createDelay(1.0);
      delayNodeRef.current = delay;

      const feedback = ctx.createGain();
      feedback.gain.value = 0;
      feedbackNodeRef.current = feedback;

      // Delay feedback loop
      delay.connect(feedback);
      feedback.connect(delay);

      const gain = ctx.createGain();
      gain.gain.value = volume;
      gainNodeRef.current = gain;

      // Destination for recording
      const streamDest = ctx.createMediaStreamDestination();
      streamDestRef.current = streamDest;

      // Connect Graph:
      // source -> filter -> waveShaper -> (dryGain & ringGain) -> preMix -> (gain & delay)
      source.connect(filter);
      filter.connect(waveShaper);

      waveShaper.connect(dryGain);
      waveShaper.connect(ringGain);

      dryGain.connect(preMix);
      ringGain.connect(preMix);

      preMix.connect(gain);
      preMix.connect(delay);
      delay.connect(gain);

      // Output to speakers and recording destination
      gain.connect(analyser);
      gain.connect(ctx.destination);
      gain.connect(streamDest);

      applyEffectPreset(selectedEffect);
      setIsActive(true);
      drawVisualizer();

    } catch (err: unknown) {
      const error = err as { name?: string };
      if (error?.name === 'NotAllowedError' || error?.name === 'PermissionDeniedError') {
        setErrorMessage("We need your microphone to change your voice! Click the lock icon in your browser's address bar to allow microphone access.");
      } else if (error?.name === 'NotFoundError') {
        setErrorMessage('No microphone found! Please connect a microphone and try again.');
      } else {
        setErrorMessage('Something went wrong accessing your microphone. Please try a different browser or check device permissions.');
      }
      setIsActive(false);
    }
  };

  // Stop Mic & Web Audio
  const stopAudio = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }

    setIsActive(false);
  }, []);

  // Handle Preset Change
  const handleSelectEffect = (key: VoiceEffectKey) => {
    setSelectedEffect(key);
    if (isActive) {
      applyEffectPreset(key);
    }
  };

  // Volume Change
  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (gainNodeRef.current && audioContextRef.current) {
      const preset = voiceEffects[selectedEffect];
      const g = (preset.gain || 1.0) * newVol;
      gainNodeRef.current.gain.setTargetAtTime(g, audioContextRef.current.currentTime, 0.05);
    }
  };

  // Start Recording
  const startRecording = () => {
    if (!streamDestRef.current) {
      if (!isActive) {
        startAudio().then(() => {
          setTimeout(startRecording, 500);
        });
      }
      return;
    }

    recordedChunksRef.current = [];
    const destStream = streamDestRef.current.stream;

    try {
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      const recorder = new MediaRecorder(destStream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setRecordedAudioUrl(url);
        setRecordedDuration(recordingSeconds);
        setIsRecording(false);
        setRecordingSeconds(0);
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
        }
      };

      recorder.start(100);
      setIsRecording(true);
      setRecordingSeconds(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch {
      setErrorMessage('Recording is not supported in this browser format.');
    }
  };

  // Stop Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
  };

  // Download Recording (convert to WAV if possible or download WebM)
  const downloadRecording = async () => {
    if (!recordedAudioUrl) return;

    try {
      const res = await fetch(recordedAudioUrl);
      const arrayBuffer = await res.arrayBuffer();

      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const tempCtx = new AudioCtx();
      const decodedBuffer = await tempCtx.decodeAudioData(arrayBuffer);
      const wavArrayBuf = audioBufferToWav(decodedBuffer);
      const wavBlob = new Blob([wavArrayBuf], { type: 'audio/wav' });
      const wavUrl = URL.createObjectURL(wavBlob);

      const a = document.createElement('a');
      a.href = wavUrl;
      a.download = `voice-effect-${selectedEffect}.wav`;
      a.click();
      tempCtx.close();
    } catch {
      // Fallback: download webm
      const a = document.createElement('a');
      a.href = recordedAudioUrl;
      a.download = `voice-effect-${selectedEffect}.webm`;
      a.click();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, [stopAudio]);

  return (
    <div className="w-full space-y-6">
      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3 text-rose-800 dark:text-rose-200 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="flex-1 font-semibold">{errorMessage}</div>
          <button type="button" onClick={() => setErrorMessage(null)} className="text-xs font-bold underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Headphones Advisory Banner */}
      <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/50 flex items-center justify-between text-xs text-blue-800 dark:text-blue-300">
        <div className="flex items-center gap-2">
          <Headphones className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <span>
            <strong>Pro Tip:</strong> Please use headphones to prevent audio feedback &amp; echo from your speakers while talking!
          </span>
        </div>
        <span className="text-[11px] font-mono opacity-80 hidden sm:inline">100% Client-Side Web Audio</span>
      </div>

      {/* VOICE EFFECT SELECTOR GRID */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg flex items-center gap-2">
            <Radio className="w-5 h-5 text-blue-600" />
            Pick a Voice Effect
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Selected: <strong>{voiceEffects[selectedEffect].name}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(voiceEffects).map(([key, effect]) => {
            const isSelected = selectedEffect === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleSelectEffect(key as VoiceEffectKey)}
                className={`p-4 rounded-2xl text-left border transition-all relative overflow-hidden group ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/60 ring-2 ring-blue-500/30 shadow-md'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">{effect.icon}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {effect.tag}
                  </span>
                </div>
                <div className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                  {effect.name}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                  {effect.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* LIVE AUDIO VISUALIZER */}
      <div className="bg-slate-950 rounded-3xl p-5 border border-slate-800 shadow-inner space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'
              }`}
            />
            <span className="font-mono">{isActive ? 'MICROPHONE ACTIVE' : 'MICROPHONE STANDBY'}</span>
          </div>

          {isRecording && (
            <div className="flex items-center gap-2 text-rose-500 font-mono font-bold animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>RECORDING {recordingSeconds}s</span>
            </div>
          )}
        </div>

        {/* Oscilloscope Waveform Canvas */}
        <div className="h-28 w-full flex items-center justify-center overflow-hidden">
          <canvas
            ref={canvasRef}
            width={800}
            height={112}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Controls inside Visualizer */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-800/80">
          {/* Main Push to Talk / Toggle Button */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={isActive ? stopAudio : startAudio}
              className={`inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl font-extrabold text-sm transition-all shadow-lg ${
                isActive
                  ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/30 animate-pulse'
              }`}
            >
              {isActive ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              <span>{isActive ? '⏹️ Stop Voice' : '🎙️ Start Talking'}</span>
            </button>

            {/* Record Button */}
            {isActive && (
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className={`inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold border transition-all ${
                  isRecording
                    ? 'bg-rose-500 text-white border-rose-400 animate-pulse'
                    : 'bg-slate-900 text-slate-200 border-slate-700 hover:bg-slate-800'
                }`}
              >
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <span>{isRecording ? '⏹️ Stop Recording' : '🔴 Record'}</span>
              </button>
            )}
          </div>

          {/* Volume Slider */}
          <div className="flex items-center gap-2.5 text-xs text-slate-300">
            <Volume2 className="w-4 h-4 text-slate-400" />
            <span>Volume:</span>
            <input
              type="range"
              min="0"
              max="1.5"
              step="0.05"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-28 sm:w-36 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <span className="font-mono text-slate-400 w-8">{Math.round(volume * 100)}%</span>
          </div>
        </div>
      </div>

      {/* RECORDED AUDIO PLAYBACK & DOWNLOAD CARD */}
      {recordedAudioUrl && (
        <div className="bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-3xl p-5 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                Your Changed Voice Recording ({recordedDuration}s)
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Listen to your transformed voice preview and download it for videos, pranks, or voiceovers!
              </p>
            </div>

            <button
              type="button"
              onClick={downloadRecording}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-105"
            >
              <Download className="w-4 h-4" />
              <span>⬇️ Download Recording (.WAV)</span>
            </button>
          </div>

          {/* Native Audio Preview Player */}
          <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
            <button
              type="button"
              onClick={() => {
                if (!audioPlayerRef.current) return;
                if (isPlayingRecording) {
                  audioPlayerRef.current.pause();
                  setIsPlayingRecording(false);
                } else {
                  audioPlayerRef.current.play();
                  setIsPlayingRecording(true);
                }
              }}
              className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm hover:bg-blue-700"
            >
              {isPlayingRecording ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>

            <audio
              ref={audioPlayerRef}
              src={recordedAudioUrl}
              onEnded={() => setIsPlayingRecording(false)}
              controls
              className="w-full h-10"
            />
          </div>
        </div>
      )}
    </div>
  );
}
