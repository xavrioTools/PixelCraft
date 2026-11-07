import React from 'react';
import {
  Sparkles,
  ArrowRight,
  RefreshCw,
  Minimize2,
  Crop,
  Maximize2,
  Wand2,
  Zap,
  ShieldCheck,
  Lock,
  Layers,
  CheckCircle2,
  Sliders,
  FileCheck,
  MousePointerClick,
  Download,
  Upload,
  HardDrive,
  Cpu,
  Globe2,
  Eye,
} from 'lucide-react';
import { useRouter } from '../../context/RouterContext';
import { TOOLS_DATA } from '../../data/toolsData';
import { ToolCard } from '../common/ToolCard';
import { FaqAccordion } from '../common/FaqAccordion';
import { QuickUploadSection } from '../home/QuickUploadSection';
import { BeforeAfterShowcase } from '../home/BeforeAfterShowcase';

export const HomeView: React.FC = () => {
  const { navigate } = useRouter();

  // SECTION 3: 5 Quick Tool Access Cards
  const quickTools = [
    {
      id: 'convert',
      name: 'Image Converter',
      path: '/convert',
      tagline: 'Convert formats seamlessly',
      description: 'Transcode between WebP, PNG, JPG, AVIF, and SVG with zero quality degradation.',
      icon: RefreshCw,
      badge: 'Multi-Format',
      accentColor: 'indigo',
    },
    {
      id: 'compress',
      name: 'Image Compressor',
      path: '/compress',
      tagline: 'Shrink file size up to 90%',
      description: 'Intelligent compression that drastically cuts file size while retaining crystal clarity.',
      icon: Minimize2,
      badge: 'High Speed',
      accentColor: 'violet',
    },
    {
      id: 'crop',
      name: 'Image Cropper',
      path: '/crop',
      tagline: 'Trim to standard ratios',
      description: 'Crop to 16:9, 4:3, 1:1, or custom aspect bounds with precision handles.',
      icon: Crop,
      badge: 'Presets',
      accentColor: 'purple',
    },
    {
      id: 'resize',
      name: 'Image Resizer',
      path: '/resize',
      tagline: 'Scale width & height dimensions',
      description: 'Resize pixel dimensions or percentage scaling with bicubic interpolation.',
      icon: Maximize2,
      badge: 'Bicubic',
      accentColor: 'blue',
    },
    {
      id: 'batch',
      name: 'Batch Studio',
      path: '/batch',
      tagline: 'Process dozens of images at once',
      description: 'Upload and edit multiple images simultaneously with parallel workers and 1-click ZIP export.',
      icon: Layers,
      badge: 'Multi-File',
      accentColor: 'fuchsia',
    },
  ];

  // SECTION 8: 6 Why PixelCraft Features
  const whyFeatures = [
    {
      title: 'Free Forever',
      description: 'No subscription, no trial period, no credits, and no paywalls. Completely free for personal and commercial projects.',
      icon: Sparkles,
    },
    {
      title: 'No Registration',
      description: 'No account creation, no password to remember, and no email newsletter spam. Upload and start immediately.',
      icon: Lock,
    },
    {
      title: 'Fast Processing',
      description: 'Harnesses your local device hardware with WebAssembly and multi-threaded workers for instant execution.',
      icon: Zap,
    },
    {
      title: 'Privacy Focused',
      description: 'Zero cloud uploads. Your photos and graphics never leave your local browser memory, guaranteeing complete confidentiality.',
      icon: ShieldCheck,
    },
    {
      title: 'Easy to Use',
      description: 'Clean, distraction-free interface with instant drag-and-drop, real-time comparisons, and intuitive presets.',
      icon: MousePointerClick,
    },
    {
      title: 'Multiple Formats',
      description: 'Full native decoding and encoding support for WebP, PNG, JPG, AVIF, SVG, GIF, BMP, and TIFF.',
      icon: Layers,
    },
  ];

  // SECTION 9: 8 Supported Formats
  const supportedFormats = [
    {
      format: 'PNG',
      name: 'Portable Network Graphics',
      badge: 'Lossless + Alpha',
      description: 'Ideal for logos, screenshots, and graphics requiring transparent backgrounds.',
      readWrite: 'Read & Export',
    },
    {
      format: 'JPG',
      name: 'Joint Photographic Experts Group',
      badge: 'Universal Photo',
      description: 'Standard photographic format with high compatibility across all web and mobile platforms.',
      readWrite: 'Read & Export',
    },
    {
      format: 'JPEG',
      name: 'JPEG Interchange Format',
      badge: 'Camera Default',
      description: 'Identical encoding to JPG, widely produced by digital cameras and smartphones.',
      readWrite: 'Read & Export',
    },
    {
      format: 'WEBP',
      name: 'Google Modern Web Format',
      badge: 'Next-Gen Web',
      description: 'Delivers 25–35% smaller file sizes than JPEG with full alpha transparency support.',
      readWrite: 'Read & Export',
    },
    {
      format: 'AVIF',
      name: 'AV1 Image File Format',
      badge: 'Maximum Compression',
      description: 'State-of-the-art compression standard providing extreme compression efficiency.',
      readWrite: 'Read & Export',
    },
    {
      format: 'GIF',
      name: 'Graphics Interchange Format',
      badge: 'Indexed Color',
      description: 'Decodes 256-color palette animations and graphics for optimization and modern export.',
      readWrite: 'Read & Optimize',
    },
    {
      format: 'BMP',
      name: 'Windows Bitmap',
      badge: 'Raw Raster',
      description: 'Uncompressed legacy bitmap format easily converted into lightweight WebP or PNG.',
      readWrite: 'Read & Convert',
    },
    {
      format: 'TIFF',
      name: 'Tagged Image File Format',
      badge: 'Print & Scans',
      description: 'High-bit-depth scanning and publishing format converted into web-ready formats.',
      readWrite: 'Read & Convert',
    },
  ];

  return (
    <div className="space-y-20 lg:space-y-28">
      {/* SECTION 2: HERO */}
      <section className="relative pt-8 sm:pt-16 pb-6 text-center max-w-6xl mx-auto px-4 sm:px-6">
        {/* Subtle decorative atmospheric background glow */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 -top-24 -z-10 transform-gpu overflow-hidden blur-3xl pointer-events-none"
        >
          <div className="relative left-[calc(50%-12rem)] aspect-[1155/678] w-[38rem] -translate-x-1/2 rotate-[25deg] bg-gradient-to-tr from-indigo-500/25 via-purple-500/20 to-pink-500/15 sm:left-[calc(50%-28rem)] sm:w-[68rem]" />
        </div>

        {/* Quiet metadata line without pills */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-4 font-medium tracking-wide">
          <span>100% In-Browser Privacy</span>
          <span aria-hidden="true">·</span>
          <span>Zero Server Uploads</span>
          <span aria-hidden="true">·</span>
          <span>No Account Required</span>
        </div>

        {/* Hero Headline */}
        <h1
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white"
          style={{ textWrap: 'balance' }}
        >
          Powerful Image Tools.{' '}
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 bg-clip-text text-transparent">
            Completely Free.
          </span>
        </h1>

        {/* Hero Description */}
        <p className="mt-5 sm:mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Convert, compress, crop, and resize images using professional online
          tools. No registration. No installation. Just upload and get started.
        </p>

        {/* Hero Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => navigate('/tools')}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.02]"
          >
            <span>Explore All Tools</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => navigate('/batch')}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 shadow-xs transition-colors"
          >
            <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Launch Batch Studio</span>
          </button>
        </div>

        {/* Hero Visual Mockup Container */}
        <div className="mt-14 relative max-w-4xl mx-auto">
          {/* Main Visual Showcase Card */}
          <div className="relative rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-4 sm:p-6 overflow-hidden">
            {/* Window control bar */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-400/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-400/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-400/80 inline-block" />
                <span className="ml-2 font-mono text-[11px] text-slate-400">pixelcraft-studio-canvas</span>
              </div>

              <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500">
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Ready</span>
                <span>·</span>
                <span>OffscreenCanvas Wasm</span>
              </div>
            </div>

            {/* Split Visual Display */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              {/* Feature Box 1: Image Preview & Conversion */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-100 dark:border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Format Conversion</span>
                  <span className="text-[10px] font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                    Lossless
                  </span>
                </div>

                <div className="h-28 rounded-xl bg-gradient-to-tr from-indigo-900 via-indigo-700 to-purple-600 flex flex-col items-center justify-center p-3 text-center text-white shadow-inner">
                  <div className="flex items-center gap-2 font-mono font-bold text-xs bg-black/40 px-3 py-1.5 rounded-lg backdrop-blur-xs">
                    <span>JPEG</span>
                    <ArrowRight className="w-3.5 h-3.5 text-indigo-300" />
                    <span className="text-emerald-300">WEBP</span>
                  </div>
                  <span className="text-[10px] text-indigo-200 mt-2">Next-Gen Core Web Vitals</span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>Input: 24-bit RGB</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Export: WebP</span>
                </div>
              </div>

              {/* Feature Box 2: Compression Comparison */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-100 dark:border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Deep Compression</span>
                  <span className="text-[10px] font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                    -84% Saved
                  </span>
                </div>

                <div className="h-28 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-950 flex flex-col items-center justify-center p-3 text-center text-white shadow-inner">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs line-through text-slate-400 font-mono">2.4 MB</span>
                    <span className="text-xl font-extrabold text-emerald-400 font-mono tabular-nums">380 KB</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-700 rounded-full mt-3 overflow-hidden">
                    <div className="w-[16%] h-full bg-emerald-400 rounded-full" />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1.5">No perceptual fidelity loss</span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>Chroma 4:2:0</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold">DCT Optimized</span>
                </div>
              </div>

              {/* Feature Box 3: Transparent Background Example */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-100 dark:border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Background Cutout</span>
                  <span className="text-[10px] font-mono font-semibold text-purple-600 dark:text-purple-400">
                    Smart Alpha
                  </span>
                </div>

                <div className="h-28 rounded-xl bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:12px_12px] bg-slate-200/60 dark:bg-slate-900 flex items-center justify-center shadow-inner relative overflow-hidden">
                  {/* Checkerboard transparency layer with floating isolated subject */}
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-rose-500 shadow-lg flex items-center justify-center text-white font-bold text-lg">
                    ✨
                  </div>
                  <span className="absolute bottom-2 text-[10px] font-mono font-semibold text-slate-600 dark:text-slate-400 bg-white/80 dark:bg-slate-950/80 px-2 py-0.5 rounded">
                    Checkerboard Alpha Mask
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>Sub-Pixel Edge</span>
                  <span className="text-purple-600 dark:text-purple-400 font-semibold">PNG / WebP</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: QUICK TOOL ACCESS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
            <Zap className="w-3.5 h-3.5" />
            <span>Instant Workspace Launch</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Quick Tool Access
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Click any core tool to launch its dedicated online workspace immediately.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {quickTools.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => navigate(t.path)}
                className="group p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-500/60 hover:shadow-md transition-all text-left flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors shadow-xs">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase font-mono">
                      {t.badge}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {t.name}
                  </h3>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {t.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700">
                  <span>Open Tool</span>
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* SECTION 4: QUICK UPLOAD */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <QuickUploadSection />
      </section>

      {/* SECTION 5: POPULAR TOOLS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Full Suite Registry</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Popular Image Utilities
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              High-performance utilities built for creators, photographers, and developers.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/tools')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors shrink-0"
          >
            <span>View All Tools</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TOOLS_DATA.slice(0, 4).map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>

      {/* SECTION 6: HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Three Simple Steps</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            How PixelCraft Works
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Zero complicated software installations. Complete your workflow in under 30 seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Step 1 */}
          <div className="p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm relative space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-extrabold text-indigo-600/30 dark:text-indigo-400/30 font-mono">
                01
              </span>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Upload className="w-5 h-5" />
              </div>
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              1. Upload Your Image
            </h3>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Drag and drop any JPG, PNG, WebP, AVIF, or SVG file directly into PixelCraft. The file is
              decoded safely into browser memory without uploading to any remote server.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm relative space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-extrabold text-purple-600/30 dark:text-purple-400/30 font-mono">
                02
              </span>
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Sliders className="w-5 h-5" />
              </div>
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              2. Choose Your Tool
            </h3>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Select conversion, compression, crop, or resize. Fine-tune output
              dimensions, format, and quality sliders with live split comparison preview.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm relative space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-extrabold text-emerald-600/30 dark:text-emerald-400/30 font-mono">
                03
              </span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Download className="w-5 h-5" />
              </div>
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              3. Download Your Result
            </h3>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Instantly download your optimized image file in your target format with zero watermarks.
              Export individual files or batch collections in a single clean ZIP package.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 7: BEFORE & AFTER SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BeforeAfterShowcase />
      </section>

      {/* SECTION 8: WHY PIXELCRAFT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-14 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="max-w-2xl mb-12">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Built for High Standards</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Why Creators Choose PixelCraft
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              We engineered PixelCraft from the ground up to eliminate the security vulnerabilities,
              queues, and paywalls typical of online image utilities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {whyFeatures.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div key={idx} className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {feat.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 9: SUPPORTED FORMATS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
            <Layers className="w-3.5 h-3.5" />
            <span>Format Compatibility Matrix</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Supported Image Formats
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Actual in-browser processing is implemented for all 8 standard image formats.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {supportedFormats.map((fmt) => (
            <div
              key={fmt.format}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between space-y-4 hover:border-indigo-400/50 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-base font-extrabold text-indigo-600 dark:text-indigo-400">
                    .{fmt.format.toLowerCase()}
                  </span>
                  <span className="text-[10px] font-semibold font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {fmt.readWrite}
                  </span>
                </div>

                <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                  {fmt.name}
                </h3>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {fmt.description}
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate('/convert')}
                className="w-full inline-flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 pt-3 border-t border-slate-100 dark:border-slate-800/80"
              >
                <span>Convert .{fmt.format.toLowerCase()}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 10: FAQ */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <FaqAccordion
          title="Frequently Asked Questions"
          subtitle="Learn how PixelCraft guarantees speed, high fidelity, and zero privacy exposure"
        />
      </section>

      {/* SECTION 11: FINAL CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="relative rounded-3xl p-8 sm:p-14 bg-gradient-to-tr from-indigo-900 via-indigo-700 to-purple-800 text-white text-center shadow-xl overflow-hidden">
          {/* Subtle decorative circles */}
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-purple-500/20 blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-indigo-200 text-xs font-semibold backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>100% Free · No Registration Ever</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
              Your Images Deserve Better. Start Editing for Free.
            </h2>

            <p className="text-sm sm:text-base text-indigo-100 leading-relaxed max-w-xl mx-auto">
              Convert, compress, crop, and resize in seconds. No waiting queues,
              no file upload limits, and no watermarks.
            </p>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => navigate('/tools')}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold text-indigo-950 bg-white hover:bg-slate-100 shadow-md transition-all hover:scale-[1.02]"
              >
                <span>Explore All Tools</span>
                <ArrowRight className="w-4 h-4 text-indigo-700" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/compress')}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-white bg-indigo-500/40 hover:bg-indigo-500/60 border border-white/20 transition-colors"
              >
                <Minimize2 className="w-4 h-4" />
                <span>Launch Compressor</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
