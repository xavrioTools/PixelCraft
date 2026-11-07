import React from 'react';
import { ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';
import { Breadcrumbs } from '../common/Breadcrumbs';

interface LegalViewProps {
  type: 'terms' | 'privacy' | 'security';
}

export const LegalView: React.FC<LegalViewProps> = ({ type }) => {
  const titles = {
    terms: 'Terms of Service',
    privacy: 'Privacy Policy',
    security: 'Client-Side Security Architecture',
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
      <Breadcrumbs />

      <div className="pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold mb-3">
          <ShieldCheck className="w-4 h-4" />
          <span>Guaranteed Open & Free</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {titles[type]}
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Last updated: November 2026 · Effective immediately for all PixelCraft visitors
        </p>
      </div>

      <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            1. Zero Registration & 100% Free Access
          </h2>
          <p>
            PixelCraft is built on the principle that essential digital image manipulation tools
            should be freely accessible to creators, developers, designers, and students worldwide.
            PixelCraft requires no sign-up, no email registration, no subscription plans, and no
            credit cards.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            2. Local Client-Side In-Browser Execution
          </h2>
          <p>
            Unlike traditional web tools that transmit files to remote cloud servers for conversion,
            PixelCraft performs all operations locally inside your web browser using HTML5 Canvas,
            OffscreenCanvas, and WebAssembly.
          </p>
          <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
            <Lock className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-slate-900 dark:text-white">Strict Data Guarantee:</span>{' '}
              Your source images, extracted layers, and converted deliverables never leave your
              device. No image telemetry or thumbnail previews are uploaded or stored.
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            3. Commercial Rights & Ownership
          </h2>
          <p>
            You retain 100% full copyright and ownership of any images processed through PixelCraft.
            PixelCraft asserts zero claims, licenses, or rights over your content. You are free to
            use all exported assets in personal and commercial projects without attribution or
            watermarks.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            4. No Tracking Cookies
          </h2>
          <p>
            PixelCraft uses only local storage (`localStorage`) on your browser strictly to remember
            your visual theme preference (Light or Dark mode). We do not deploy third-party advertising
            trackers, profiling beacons, or marketing cookies.
          </p>
        </section>
      </div>
    </div>
  );
};
