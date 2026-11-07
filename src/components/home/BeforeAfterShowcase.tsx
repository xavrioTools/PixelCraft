import React, { useState } from 'react';
import { Sparkles, Layers, Sliders, CheckCircle2 } from 'lucide-react';

interface ShowcaseExample {
  id: 'compress' | 'convert' | 'crop' | 'background';
  label: string;
  title: string;
  description: string;
  beforeLabel: string;
  afterLabel: string;
  metricBadge: string;
  beforeStats: string;
  afterStats: string;
  originalImage: string;
  processedImage: string;
}

// Inline high quality SVG/canvas representations of sample states
const generateSampleImages = () => {
  // 1. Compression Example
  const compressOriginal = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500"><defs><linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%231e1b4b"/><stop offset="50%" stop-color="%234338ca"/><stop offset="100%" stop-color="%236366f1"/></linearGradient></defs><rect width="800" height="500" fill="url(%23g1)"/><circle cx="400" cy="250" r="140" fill="%23ffffff" fill-opacity="0.15"/><polygon points="400,140 480,310 320,310" fill="%23ffffff" fill-opacity="0.25"/><text x="400" y="380" fill="%23ffffff" font-family="sans-serif" font-weight="bold" font-size="28" text-anchor="middle">Uncompressed RAW (2.8 MB)</text><text x="400" y="420" fill="%23cbd5e1" font-family="sans-serif" font-size="16" text-anchor="middle">Heavy unoptimized image payload</text></svg>`;

  const compressOptimized = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500"><defs><linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%231e1b4b"/><stop offset="50%" stop-color="%234338ca"/><stop offset="100%" stop-color="%236366f1"/></linearGradient></defs><rect width="800" height="500" fill="url(%23g2)"/><circle cx="400" cy="250" r="140" fill="%23ffffff" fill-opacity="0.18"/><polygon points="400,140 480,310 320,310" fill="%23ffffff" fill-opacity="0.3"/><text x="400" y="380" fill="%23ffffff" font-family="sans-serif" font-weight="bold" font-size="28" text-anchor="middle">Lossless WebP (340 KB)</text><text x="400" y="420" fill="%23a7f3d0" font-family="sans-serif" font-size="16" text-anchor="middle">-88% File Size · Identical Visual Clarity</text></svg>`;

  // 2. Format Conversion Example
  const convertOriginal = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500"><defs><linearGradient id="g3" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23334155"/><stop offset="100%" stop-color="%230f172a"/></linearGradient></defs><rect width="800" height="500" fill="url(%23g3)"/><circle cx="280" cy="250" r="100" fill="%23f97316"/><rect x="420" y="160" width="180" height="180" rx="20" fill="%2306b6d4"/><text x="400" y="400" fill="%23ffffff" font-family="sans-serif" font-weight="bold" font-size="24" text-anchor="middle">Legacy JPEG (24-bit Non-Transparent)</text></svg>`;

  const convertOptimized = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500"><defs><pattern id="p1" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="%23e2e8f0"/><rect x="10" width="10" height="10" fill="%23f8fafc"/><rect y="10" width="10" height="10" fill="%23f8fafc"/><rect x="10" y="10" width="10" height="10" fill="%23e2e8f0"/></pattern></defs><rect width="800" height="500" fill="url(%23p1)"/><circle cx="280" cy="250" r="100" fill="%23f97316" fill-opacity="0.95"/><rect x="420" y="160" width="180" height="180" rx="20" fill="%2306b6d4" fill-opacity="0.95"/><text x="400" y="400" fill="%230f172a" font-family="sans-serif" font-weight="bold" font-size="24" text-anchor="middle">Modern WebP / AVIF (Alpha Transparency)</text></svg>`;

  // 3. Crop & Resize Example
  const cropOriginal = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500"><defs><linearGradient id="bgG" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23059669"/><stop offset="100%" stop-color="%23047857"/></linearGradient></defs><rect width="800" height="500" fill="url(%23bgG)"/><circle cx="400" cy="220" r="90" fill="%23fbbf24"/><rect x="340" y="300" width="120" height="160" rx="30" fill="%23f59e0b"/><text x="400" y="420" fill="%23ffffff" font-family="sans-serif" font-weight="bold" font-size="24" text-anchor="middle">Uncropped 16:9 Landscape Banner</text></svg>`;

  const cropCropped = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500"><defs><linearGradient id="bgG2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23047857"/><stop offset="100%" stop-color="%23065f46"/></linearGradient></defs><rect width="800" height="500" fill="url(%23bgG2)"/><circle cx="400" cy="210" r="110" fill="%23fbbf24"/><text x="400" y="390" fill="%23ffffff" font-family="sans-serif" font-weight="bold" font-size="24" text-anchor="middle">1:1 Square Avatar Crop (Lossless Sharpness)</text></svg>`;

  // 4. Background Removal Example
  const bgOriginal = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500"><rect width="800" height="500" fill="%23f1f5f9"/><circle cx="400" cy="250" r="120" fill="%236366f1"/><rect x="360" y="210" width="80" height="80" rx="12" fill="%23ffffff"/><text x="400" y="410" fill="%23334155" font-family="sans-serif" font-weight="bold" font-size="22" text-anchor="middle">Solid Studio Background</text></svg>`;

  const bgRemoved = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500"><defs><pattern id="checkBg" width="24" height="24" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill="%23cbd5e1"/><rect x="12" width="12" height="12" fill="%23ffffff"/><rect y="12" width="12" height="12" fill="%23ffffff"/><rect x="12" y="12" width="12" height="12" fill="%23cbd5e1"/></pattern></defs><rect width="800" height="500" fill="url(%23checkBg)"/><circle cx="400" cy="250" r="120" fill="%236366f1"/><rect x="360" y="210" width="80" height="80" rx="12" fill="%23ffffff"/><text x="400" y="410" fill="%231e293b" font-family="sans-serif" font-weight="bold" font-size="22" text-anchor="middle">Isolated Alpha PNG</text></svg>`;

  return {
    compressOriginal,
    compressOptimized,
    convertOriginal,
    convertOptimized,
    cropOriginal,
    cropCropped,
    bgOriginal,
    bgRemoved,
  };
};

export const BeforeAfterShowcase: React.FC = () => {
  const samples = generateSampleImages();
  const [activeTab, setActiveTab] = useState<'compress' | 'convert' | 'crop' | 'background'>('compress');
  const [sliderPos, setSliderPos] = useState(50); // 0 to 100

  const examples: Record<string, ShowcaseExample> = {
    compress: {
      id: 'compress',
      label: 'Compression',
      title: 'Original vs. Compressed',
      description: 'Perceptual quantization strips invisible color data while retaining crystal clear edges.',
      beforeLabel: 'Original JPEG (2.8 MB)',
      afterLabel: 'Compressed WebP (340 KB)',
      metricBadge: '-88% Payload Saved',
      beforeStats: '2,840 KB · High Bandwidth',
      afterStats: '340 KB · 150ms Speed',
      originalImage: samples.compressOriginal,
      processedImage: samples.compressOptimized,
    },
    convert: {
      id: 'convert',
      label: 'Conversion',
      title: 'Original vs. Converted',
      description: 'Convert rigid legacy formats into modern WebP and AVIF with full alpha transparency support.',
      beforeLabel: 'Standard JPEG (Opaque)',
      afterLabel: 'Modern WebP (Alpha Preserved)',
      metricBadge: 'Lossless Transcoding',
      beforeStats: 'JPEG · No Alpha',
      afterStats: 'WebP · 8-bit Alpha Channel',
      originalImage: samples.convertOriginal,
      processedImage: samples.convertOptimized,
    },
    crop: {
      id: 'crop',
      label: 'Crop & Resize',
      title: 'Original vs. 1:1 Crop',
      description: 'Sub-pixel aspect ratio cropping with stepped downscaling and unsharp mask sharpening.',
      beforeLabel: 'Full 16:9 Banner Photo',
      afterLabel: '1:1 Square Profile Crop',
      metricBadge: 'Zero Pixel Blur',
      beforeStats: '1920×1080px · 16:9 Aspect',
      afterStats: '1080×1080px · 1:1 Square',
      originalImage: samples.cropOriginal,
      processedImage: samples.cropCropped,
    },
    background: {
      id: 'background',
      label: 'Background Remover',
      title: 'Solid Backdrop vs. Transparent Cutout',
      description: 'Client-side edge detection isolates subject matter with clean sub-pixel anti-aliasing.',
      beforeLabel: 'Solid Studio Backdrop',
      afterLabel: 'Alpha Channel Cutout',
      metricBadge: '100% Client-Side Cutout',
      beforeStats: 'Opaque 24-bit Backdrop',
      afterStats: 'Alpha Mask PNG · Isolated Subject',
      originalImage: samples.bgOriginal,
      processedImage: samples.bgRemoved,
    },
  };

  const current = examples[activeTab];

  return (
    <div className="w-full">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
          <Sliders className="w-3.5 h-3.5" />
          <span>Interactive Comparison</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          See the Difference with PixelCraft
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Drag the interactive slider horizontally to compare before and after results in real-time.
        </p>
      </div>

      {/* Segmented Mode Selector */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <div className="inline-flex rounded-xl p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          {(['compress', 'convert', 'crop', 'background'] as const).map((tabKey) => {
            const ex = examples[tabKey];
            const isActive = activeTab === tabKey;
            return (
              <button
                key={tabKey}
                type="button"
                onClick={() => {
                  setActiveTab(tabKey);
                  setSliderPos(50);
                }}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {ex.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison Viewport Card */}
      <div className="max-w-4xl mx-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg overflow-hidden">
        {/* Top Info Bar */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-950/40 text-xs">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">
              {current.title}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-[11px]">
              {current.description}
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="font-mono">{current.metricBadge}</span>
          </div>
        </div>

        {/* Interactive Split Slider Surface */}
        <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] max-h-[500px] bg-slate-950 overflow-hidden select-none">
          {/* Base Image (Original) */}
          <img
            src={current.originalImage}
            alt={current.beforeLabel}
            className="w-full h-full object-cover block pointer-events-none"
          />

          {/* Foreground Clipped Image (Optimized) */}
          <div
            className="absolute inset-0 overflow-hidden pointer-events-none"
            style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}
          >
            <img
              src={current.processedImage}
              alt={current.afterLabel}
              className="w-full h-full object-cover block"
            />
          </div>

          {/* Vertical Divider Line with Grab Handle */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white shadow-2xl pointer-events-none flex items-center justify-center"
            style={{ left: `${sliderPos}%` }}
          >
            <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-900 border-2 border-indigo-600 shadow-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs select-none">
              ⇄
            </div>
          </div>

          {/* Floating Badges */}
          <div className="absolute top-4 left-4 px-3 py-1 rounded-lg text-xs font-semibold bg-black/70 text-white backdrop-blur-sm pointer-events-none">
            {current.beforeLabel}
          </div>

          <div className="absolute top-4 right-4 px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-600/90 text-white backdrop-blur-sm pointer-events-none">
            {current.afterLabel}
          </div>

          {/* User Range Slider overlay */}
          <input
            type="range"
            min="0"
            max="100"
            value={sliderPos}
            onChange={(e) => setSliderPos(Number(e.target.value))}
            className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full z-10"
            aria-label="Comparison slider position"
          />
        </div>

        {/* Bottom Metrics Bar */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="font-sans text-slate-400 font-semibold">BEFORE:</span>
            <span className="text-slate-700 dark:text-slate-300 font-bold">{current.beforeStats}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-sans text-slate-400 font-semibold">AFTER:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{current.afterStats}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
