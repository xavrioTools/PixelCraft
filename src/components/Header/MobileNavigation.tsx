import React from 'react';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import { MAIN_NAV_ITEMS } from './DesktopNavigation';
import { useRouter } from '../../context/RouterContext';
import { ThemeSwitcher } from '../common/ThemeSwitcher';

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({ isOpen, onClose }) => {
  const { currentPath, navigate } = useRouter();

  if (!isOpen) return null;

  const handleNavigate = (href: string) => {
    navigate(href);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Mobile Navigation"
      className="fixed inset-0 z-50 md:hidden flex flex-col"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="relative z-10 w-full max-w-sm ml-auto h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col p-6 overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
              PixelCraft
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Links */}
        <div className="py-6 flex flex-col gap-2">
          {MAIN_NAV_ITEMS.map((item) => {
            const active =
              item.href === '/'
                ? currentPath === '/'
                : currentPath === item.href || currentPath.startsWith(`${item.href}/`);

            return (
              <button
                key={item.href}
                type="button"
                onClick={() => handleNavigate(item.href)}
                className={`flex items-center justify-between px-4 py-3 rounded-lg text-left text-sm font-medium transition-colors ${
                  active
                    ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <span>{item.label}</span>
                <ArrowRight className="w-4 h-4 opacity-50" />
              </button>
            );
          })}
        </div>

        {/* Bottom Actions */}
        <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-4">
          <div className="flex items-center justify-between px-2">
            <span className="text-sm text-slate-500 dark:text-slate-400">Theme</span>
            <ThemeSwitcher />
          </div>

          <button
            type="button"
            onClick={() => handleNavigate('/tools')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-sm transition-colors"
          >
            <span>Explore All Tools</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-center text-xs text-slate-400 dark:text-slate-500">
            100% Free · No Registration Needed
          </p>
        </div>
      </div>
    </div>
  );
};
