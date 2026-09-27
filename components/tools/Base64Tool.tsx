'use client';

import React, { useState } from 'react';
import { Copy, Check, ArrowRightLeft, UploadCloud, Download, AlertCircle } from 'lucide-react';

export default function Base64Tool() {
  const [mode, setMode] = useState<'text' | 'file'>('text');
  const [direction, setDirection] = useState<'encode' | 'decode'>('encode');
  const [includeDataUrl, setIncludeDataUrl] = useState(false);

  // Text mode state
  const [textInput, setTextInput] = useState('MultiZest: Fast, Free & Private Web Tools');
  const [textOutput, setTextOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // File mode state
  const [fileInput, setFileInput] = useState<File | null>(null);
  const [fileBase64Output, setFileBase64Output] = useState<string>('');
  const [decodeBase64Input, setDecodeBase64Input] = useState<string>('');
  const [decodedFileUrl, setDecodedFileUrl] = useState<string | null>(null);
  const [decodedFileName, setDecodedFileName] = useState<string>('decoded-file.bin');

  // Convert text
  const processText = (val: string, dir: 'encode' | 'decode') => {
    setErrorMsg(null);
    if (!val) {
      setTextOutput('');
      return;
    }

    try {
      if (dir === 'encode') {
        const encoded = btoa(unescape(encodeURIComponent(val)));
        setTextOutput(encoded);
      } else {
        const decoded = decodeURIComponent(escape(atob(val.trim())));
        setTextOutput(decoded);
      }
    } catch (err) {
      setErrorMsg('Invalid Base64 sequence for decoding.');
      setTextOutput('');
    }
  };

  React.useEffect(() => {
    if (mode === 'text') {
      processText(textInput, direction);
    }
  }, [textInput, direction, mode]);

  // Handle file encode
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileInput(file);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (includeDataUrl) {
        setFileBase64Output(result);
      } else {
        // Strip data:mime/type;base64,
        const raw = result.split(',')[1] || result;
        setFileBase64Output(raw);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle file decode
  const handleDecodeFile = () => {
    setErrorMsg(null);
    if (!decodeBase64Input.trim()) return;

    try {
      let base64 = decodeBase64Input.trim();
      let mimeType = 'application/octet-stream';

      if (base64.startsWith('data:')) {
        const parts = base64.split(',');
        mimeType = parts[0].split(':')[1].split(';')[0];
        base64 = parts[1];
      }

      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });
      const url = URL.createObjectURL(blob);

      setDecodedFileUrl(url);
      setDecodedFileName(`decoded-asset-${Date.now()}.${mimeType.split('/')[1] || 'bin'}`);
    } catch (err) {
      setErrorMsg('Could not decode string into a valid binary file.');
    }
  };

  const handleCopy = async (str: string) => {
    try {
      await navigator.clipboard.writeText(str);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {}
  };

  return (
    <div className="space-y-6">
      {/* Mode Selectors */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
        {/* Text vs File Mode */}
        <div className="flex rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setMode('text')}
            className={`px-4 py-1.5 rounded-lg font-bold transition-all ${
              mode === 'text' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Text String Mode
          </button>
          <button
            type="button"
            onClick={() => setMode('file')}
            className={`px-4 py-1.5 rounded-lg font-bold transition-all ${
              mode === 'file' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Binary File Mode
          </button>
        </div>

        {/* Encode vs Decode */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDirection('encode')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
              direction === 'encode'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            Encode → Base64
          </button>
          <button
            type="button"
            onClick={() => setDirection('decode')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
              direction === 'decode'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            Decode ← from Base64
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-xs font-semibold text-red-700 dark:text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* TEXT MODE */}
      {mode === 'text' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              {direction === 'encode' ? 'Plain Text Input' : 'Base64 Encoded Input'}
            </label>
            <textarea
              rows={10}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Paste or type text..."
              className="w-full p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-mono focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>{direction === 'encode' ? 'Base64 Result' : 'Decoded Plain Text'}</span>
              <button
                type="button"
                onClick={() => handleCopy(textOutput)}
                disabled={!textOutput}
                className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold inline-flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <textarea
              readOnly
              rows={10}
              value={textOutput}
              placeholder="Result will appear here..."
              className="w-full p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* FILE MODE */}
      {mode === 'file' && (
        <div className="space-y-6">
          {direction === 'encode' ? (
            <div className="space-y-4">
              <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 rounded-3xl p-8 text-center cursor-pointer bg-slate-50/50 dark:bg-slate-900/50 block">
                <input type="file" onChange={handleFileUpload} className="hidden" />
                <div className="flex flex-col items-center">
                  <UploadCloud className="w-8 h-8 text-blue-600" />
                  <span className="mt-3 text-sm font-bold text-slate-900 dark:text-white">
                    {fileInput ? fileInput.name : 'Select any file to encode into Base64'}
                  </span>
                  <span className="text-xs text-slate-400 mt-1">
                    Images, PDFs, documents, icons (100% processed in browser)
                  </span>
                </div>
              </label>

              <div className="flex items-center gap-2">
                <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeDataUrl}
                    onChange={(e) => setIncludeDataUrl(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-blue-600"
                  />
                  <span>Include Data URL Header (data:mime/type;base64,...)</span>
                </label>
              </div>

              {fileBase64Output && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span>Base64 String ({fileBase64Output.length} characters)</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(fileBase64Output)}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold inline-flex items-center gap-1.5"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy Base64'}</span>
                    </button>
                  </div>
                  <textarea
                    readOnly
                    rows={8}
                    value={fileBase64Output}
                    className="w-full p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono text-xs break-all"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Paste Base64 String to Reconstruct File
                </label>
                <textarea
                  rows={8}
                  value={decodeBase64Input}
                  onChange={(e) => setDecodeBase64Input(e.target.value)}
                  placeholder="Paste Base64 data (with or without data: URI header)..."
                  className="w-full p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono text-xs"
                />
              </div>

              <button
                type="button"
                onClick={handleDecodeFile}
                disabled={!decodeBase64Input.trim()}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold disabled:opacity-40"
              >
                Decode into Binary File
              </button>

              {decodedFileUrl && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-200">
                    File ready to download: {decodedFileName}
                  </span>
                  <a
                    href={decodedFileUrl}
                    download={decodedFileName}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download File</span>
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
