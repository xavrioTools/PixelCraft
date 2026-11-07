import React from 'react';
import { Sparkles, ShieldCheck, Heart } from 'lucide-react';
import { useRouter } from '../../context/RouterContext';

export const Footer: React.FC = () => {
  const { navigate } = useRouter();

  const handleLink = (path: string) => {
    navigate(path);
  };

  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 transition-colors mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Column 1: Brand description (spans 2 cols on desktop) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Pixel<span className="text-indigo-600 dark:text-indigo-400">Craft</span>
              </span>
            </div>

            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Everything You Need to Edit Images Online.
            </p>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
              PixelCraft is a modern, high-performance image editing suite operating entirely inside
              your browser. Zero server uploads, instant execution, and free forever without
              sign-up.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>100% Client-Side Privacy Guaranteed</span>
            </div>
          </div>

          {/* Column 2: Image Tools */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
              Image Tools
            </h3>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <button
                  type="button"
                  onClick={() => handleLink('/convert')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Image Converter
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleLink('/compress')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Image Compressor
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleLink('/resize')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Image Resizer
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleLink('/crop')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Image Cropper
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleLink('/background-remover')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Background Remover
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleLink('/webp-converter')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  WebP Converter
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleLink('/bulk-resize')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Bulk Resizer
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
              Resources
            </h3>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <button
                  type="button"
                  onClick={() => handleLink('/tools')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  All Tools Directory
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleLink('/security')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Privacy Architecture
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleLink('/convert')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Supported Formats
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleLink('/compress')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Image Quality Guide
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal Pages */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
              Legal Pages
            </h3>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <button
                  type="button"
                  onClick={() => handleLink('/privacy')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleLink('/terms')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleLink('/security')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Client-Side Data Security
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleLink('/privacy')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Cookie Policy
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1">
            <span>Built with precision for creators everywhere</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 inline fill-rose-500" />
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span>Free Forever</span>
            <span aria-hidden="true">·</span>
            <span>No Account Needed</span>
            <span aria-hidden="true">·</span>
            <span>© {new Date().getFullYear()} PixelCraft</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
