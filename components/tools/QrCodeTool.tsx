'use client';

import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  Link as LinkIcon,
  FileText,
  Wifi,
  Mail,
  Phone,
  Download,
  Check,
  RefreshCw,
  Palette,
  Sliders,
  Copy,
} from 'lucide-react';

type PayloadType = 'url' | 'text' | 'wifi' | 'email' | 'phone';
type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export default function QrCodeTool() {
  const [payloadType, setPayloadType] = useState<PayloadType>('url');

  // Input states
  const [urlVal, setUrlVal] = useState('https://multizest.com');
  const [textVal, setTextVal] = useState('Welcome to MultiZest!');
  const [wifiSsid, setWifiSsid] = useState('MyHomeWiFi');
  const [wifiPass, setWifiPass] = useState('');
  const [wifiType, setWifiType] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [wifiHidden, setWifiHidden] = useState(false);
  const [emailTo, setEmailTo] = useState('contact@example.com');
  const [emailSubject, setEmailSubject] = useState('Inquiry');
  const [emailBody, setEmailBody] = useState('Hello MultiZest team,');
  const [phoneVal, setPhoneVal] = useState('+1 555 123 4567');

  // Customization
  const [fgColor, setFgColor] = useState('#0f172a');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [size, setSize] = useState(320);
  const [errorLevel, setErrorLevel] = useState<ErrorCorrectionLevel>('M');

  // Output
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [qrSvg, setQrSvg] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Re-generate QR whenever payload or options change
  useEffect(() => {
    let isCancelled = false;

    const getPayload = (): string => {
      switch (payloadType) {
        case 'url':
          return urlVal.trim() || 'https://multizest.com';
        case 'text':
          return textVal || 'MultiZest';
        case 'wifi': {
          const t = wifiType === 'nopass' ? 'nopass' : wifiType;
          const p = wifiType === 'nopass' ? '' : wifiPass;
          return `WIFI:T:${t};S:${wifiSsid};P:${p};H:${wifiHidden ? 'true' : 'false'};;`;
        }
        case 'email': {
          const encSubject = encodeURIComponent(emailSubject);
          const encBody = encodeURIComponent(emailBody);
          return `mailto:${emailTo.trim()}?subject=${encSubject}&body=${encBody}`;
        }
        case 'phone':
          return `tel:${phoneVal.replace(/\s+/g, '')}`;
        default:
          return 'https://multizest.com';
      }
    };

    const generate = async () => {
      setIsGenerating(true);
      try {
        const payload = getPayload();

        // Generate PNG data URL
        const dataUrl = await QRCode.toDataURL(payload, {
          width: size,
          margin: 2,
          color: {
            dark: fgColor,
            light: bgColor,
          },
          errorCorrectionLevel: errorLevel,
        });

        // Generate SVG string
        const svgString = await QRCode.toString(payload, {
          type: 'svg',
          width: size,
          margin: 2,
          color: {
            dark: fgColor,
            light: bgColor,
          },
          errorCorrectionLevel: errorLevel,
        });

        if (!isCancelled) {
          setQrDataUrl(dataUrl);
          setQrSvg(svgString);
        }
      } catch (err) {
        console.error('QR code generation failed:', err);
      } finally {
        if (!isCancelled) setIsGenerating(false);
      }
    };

    generate();

    return () => {
      isCancelled = true;
    };
  }, [
    payloadType,
    urlVal,
    textVal,
    wifiSsid,
    wifiPass,
    wifiType,
    wifiHidden,
    emailTo,
    emailSubject,
    emailBody,
    phoneVal,
    fgColor,
    bgColor,
    size,
    errorLevel,
  ]);

  const handleDownloadPng = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `multizest-qr-${payloadType}-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadSvg = () => {
    if (!qrSvg) return;
    const blob = new Blob([qrSvg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `multizest-qr-${payloadType}-${Date.now()}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const colorPresets = [
    { name: 'Classic Dark', fg: '#0f172a', bg: '#ffffff' },
    { name: 'Royal Blue', fg: '#1e40af', bg: '#eff6ff' },
    { name: 'Deep Violet', fg: '#5b21b6', bg: '#f5f3ff' },
    { name: 'Forest Emerald', fg: '#065f46', bg: '#ecfdf5' },
    { name: 'Midnight Gold', fg: '#78350f', bg: '#fffbeb' },
  ];

  return (
    <div className="space-y-8">
      {/* Type selection tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60">
        {[
          { id: 'url', label: 'Website URL', icon: <LinkIcon className="w-4 h-4" /> },
          { id: 'text', label: 'Plain Text', icon: <FileText className="w-4 h-4" /> },
          { id: 'wifi', label: 'WiFi Network', icon: <Wifi className="w-4 h-4" /> },
          { id: 'email', label: 'Email Draft', icon: <Mail className="w-4 h-4" /> },
          { id: 'phone', label: 'Phone Number', icon: <Phone className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setPayloadType(tab.id as PayloadType)}
            className={`flex-1 min-w-[110px] py-2.5 px-3 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-2 transition-all ${
              payloadType === tab.id
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left column: Inputs & Customization (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Payload Specific Input Fields */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Payload Content</span>
            </h3>

            {payloadType === 'url' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Target Website URL
                </label>
                <input
                  type="url"
                  value={urlVal}
                  onChange={(e) => setUrlVal(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Enter complete address starting with https://
                </span>
              </div>
            )}

            {payloadType === 'text' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Plain Text / Notes
                </label>
                <textarea
                  rows={4}
                  value={textVal}
                  onChange={(e) => setTextVal(e.target.value)}
                  placeholder="Enter message, instructions, or alphanumeric code..."
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            )}

            {payloadType === 'wifi' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Network Name (SSID)
                  </label>
                  <input
                    type="text"
                    value={wifiSsid}
                    onChange={(e) => setWifiSsid(e.target.value)}
                    placeholder="e.g. CafeGuestWiFi"
                    className="w-full px-3 py-2 rounded-xl text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Password
                    </label>
                    <input
                      type="text"
                      disabled={wifiType === 'nopass'}
                      value={wifiPass}
                      onChange={(e) => setWifiPass(e.target.value)}
                      placeholder={wifiType === 'nopass' ? 'Open network' : 'WiFi Password'}
                      className="w-full px-3 py-2 rounded-xl text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white disabled:opacity-40"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Encryption
                    </label>
                    <select
                      value={wifiType}
                      onChange={(e) => setWifiType(e.target.value as 'WPA' | 'WEP' | 'nopass')}
                      className="w-full px-3 py-2 rounded-xl text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                    >
                      <option value="WPA">WPA / WPA2 / WPA3</option>
                      <option value="WEP">WEP</option>
                      <option value="nopass">None (Open Network)</option>
                    </select>
                  </div>
                </div>
                <label className="inline-flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <input
                    type="checkbox"
                    checked={wifiHidden}
                    onChange={(e) => setWifiHidden(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span>Hidden Network SSID</span>
                </label>
              </div>
            )}

            {payloadType === 'email' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Recipient Email
                  </label>
                  <input
                    type="email"
                    value={emailTo}
                    onChange={(e) => setEmailTo(e.target.value)}
                    placeholder="support@company.com"
                    className="w-full px-3 py-2 rounded-xl text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Inquiry or Feedback"
                    className="w-full px-3 py-2 rounded-xl text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Draft Body
                  </label>
                  <textarea
                    rows={2}
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            )}

            {payloadType === 'phone' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phoneVal}
                  onChange={(e) => setPhoneVal(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Include country code for international calls.
                </span>
              </div>
            )}
          </div>

          {/* Customization Options Panel */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Palette className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Appearance & Color Styling</span>
            </h3>

            {/* Color Swatch Presets */}
            <div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                Preset Palettes
              </span>
              <div className="flex flex-wrap gap-2">
                {colorPresets.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => {
                      setFgColor(p.fg);
                      setBgColor(p.bg);
                    }}
                    className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium flex items-center gap-2 hover:border-blue-500 transition-colors"
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-slate-300"
                      style={{ backgroundColor: p.fg }}
                    />
                    <span className="text-slate-700 dark:text-slate-300">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Pickers */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Foreground Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg text-xs font-mono uppercase bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Background Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg text-xs font-mono uppercase bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600"
                  />
                </div>
              </div>
            </div>

            {/* Size & Error Correction */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Output Size</span>
                  <span className="text-blue-600 dark:text-blue-400 font-mono">{size}px</span>
                </div>
                <input
                  type="range"
                  min={200}
                  max={800}
                  step={20}
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Error Correction Level
                </label>
                <select
                  value={errorLevel}
                  onChange={(e) => setErrorLevel(e.target.value as ErrorCorrectionLevel)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
                >
                  <option value="L">Low (~7% recovery)</option>
                  <option value="M">Medium (~15% recovery) [Recommended]</option>
                  <option value="Q">Quartile (~25% recovery)</option>
                  <option value="H">High (~30% recovery) [Print / Outdoor]</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Live Preview & Downloads (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 flex flex-col items-center text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Real-Time Preview
            </span>

            {/* QR Card Frame */}
            <div
              className="p-5 rounded-2xl shadow-xl transition-all duration-300 flex items-center justify-center min-h-[260px] min-w-[260px]"
              style={{ backgroundColor: bgColor }}
            >
              {qrDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrDataUrl}
                  alt="Generated QR Code"
                  width={240}
                  height={240}
                  className="rounded-lg shadow-sm"
                />
              ) : (
                <div className="flex items-center justify-center h-48 w-48 text-xs text-slate-400">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                </div>
              )}
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 max-w-xs">
              Direct permanent static QR code. No intermediate redirects, no expiration date.
            </p>

            {/* Download Buttons */}
            <div className="w-full grid grid-cols-2 gap-3 mt-6">
              <button
                type="button"
                onClick={handleDownloadPng}
                disabled={!qrDataUrl || isGenerating}
                className="py-3 px-4 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 active:scale-98 transition-all inline-flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Download PNG</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadSvg}
                disabled={!qrSvg || isGenerating}
                className="py-3 px-4 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 active:scale-98 transition-all inline-flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Download SVG</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
