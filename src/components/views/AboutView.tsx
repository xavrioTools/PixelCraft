import React from 'react';
import { Sparkles, ShieldCheck, Zap, Lock, Layers, Cpu, Heart, CheckCircle2, Compass, ArrowRight } from 'lucide-react';
import { useRouter } from '../../context/RouterContext';
import { Breadcrumbs } from '../common/Breadcrumbs';

export const AboutView: React.FC = () => {
  const { navigate } = useRouter();

  const values = [
    {
      icon: ShieldCheck,
      title: '100% Client-Side Privacy',
      description: 'Your photos never leave your device. All editing, compression, conversion, and optimization happen entirely in your browser RAM using HTML5 Canvas and WebAssembly.',
    },
    {
      icon: Zap,
      title: 'Lightning-Fast Execution',
      description: 'No waiting for server uploads or download queues. Experience instant multi-threaded image processing at native hardware speeds.',
    },
    {
      icon: Lock,
      title: 'Zero Account & Registration',
      description: 'No sign-ups, no tracking cookies, no paywalls, and no subscription fees. PixelCraft is completely free for everyone, forever.',
    },
    {
      icon: Layers,
      title: 'Professional Batch Studio',
      description: 'Process dozens of images concurrently in memory with one-click presets, bulk resizers, and zip package exports.',
    },
  ];

  const toolsList = [
    { name: 'Image Converter', desc: 'Seamlessly convert between WebP, PNG, JPG, and AVIF.', path: '/convert' },
    { name: 'Image Compressor', desc: 'Shrink file size by up to 90% without visible quality loss.', path: '/compress' },
    { name: 'Image Cropper', desc: 'Precision pixel bounding boxes with standard aspect ratio presets.', path: '/crop' },
    { name: 'Image Resizer', desc: 'Scale dimensions or percentage with aspect ratio lock and bicubic filtering.', path: '/resize' },
    { name: 'Background Remover', desc: 'Smart edge boundary detection with solid color, gradient, or custom backdrops.', path: '/background-remover' },
    { name: 'WebP Converter', desc: 'Modernize legacy assets for Google Core Web Vitals.', path: '/webp-converter' },
    { name: 'Batch Studio', desc: 'Apply quick action presets and bulk operations simultaneously.', path: '/batch' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16">
      {/* Breadcrumbs */}
      <Breadcrumbs />

      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 text-xs font-bold tracking-wide uppercase">
          <Sparkles className="w-4 h-4" />
          <span>About PixelCraft</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
          Empowering Creators with Lightning-Fast, <span className="text-indigo-600 dark:text-indigo-400">100% Private</span> Image Processing
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
          PixelCraft is built for photographers, designers, developers, and digital creators who demand uncompromising quality, instant execution, and absolute privacy for their visual assets.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            type="button"
            onClick={() => navigate('/tools')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            <span>Explore All Tools</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => navigate('/batch')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 font-bold text-sm shadow-xs transition-all cursor-pointer"
          >
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>Open Batch Studio</span>
          </button>
        </div>
      </div>

      {/* Core Principles Grid */}
      <div className="space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Why Creators Choose PixelCraft
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Engineered from the ground up for performance, security, and simplicity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((v, i) => {
            const Icon = v.icon;
            return (
              <div
                key={i}
                className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4 hover:border-indigo-500/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {v.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {v.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Technology & Architecture Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center p-8 sm:p-12 rounded-3xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/50">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
            <Cpu className="w-4 h-4" />
            <span>Browser-Native Engine</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            How Client-Side Processing Protects Your Work
          </h2>

          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Traditional online image editors upload your raw photographs to remote cloud servers, storing copies and exposing your sensitive data. PixelCraft changes the paradigm entirely.
          </p>

          <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <span>Zero network transmission: Files stay entirely within your local memory.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <span>Multi-threaded Web Worker architecture ensures your browser UI never freezes during heavy batch runs.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <span>Lossless canvas pipelines with anti-blur sharpening and precise color profiles.</span>
            </li>
          </ul>
        </div>

        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Explore PixelCraft Suite
          </h3>
          <div className="space-y-3">
            {toolsList.map((t, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => navigate(t.path)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 border border-slate-200/80 dark:border-slate-800 text-left transition-colors cursor-pointer group"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    {t.name}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {t.desc}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Community & Commitment */}
      <div className="text-center max-w-2xl mx-auto space-y-6 pt-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Free Forever, Built with Passion
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          We believe professional tools should be accessible to everyone without paywalls or intrusive ads. PixelCraft is maintained by a community of engineers and designers dedicated to web performance and user privacy.
        </p>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
          <span>Crafted with</span>
          <Heart className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
          <span>for creators everywhere</span>
        </div>
      </div>
    </div>
  );
};
