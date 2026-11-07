import React from 'react';
import { Sparkles, Compass, Menu } from 'lucide-react';
import { useRouter } from '../../context/RouterContext';
import { DesktopNavigation } from './DesktopNavigation';
import { ThemeSwitcher } from '../common/ThemeSwitcher';

interface HeaderProps {
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const { navigate } = useRouter();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-slate-950/85 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 lg:gap-8">
        {/* Zone 1: Brand wordmark */}
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg group shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
            Pixel<span className="text-indigo-600 dark:text-indigo-400">Craft</span>
          </span>
        </button>

        {/* Zone 2: Navigation Links */}
        <DesktopNavigation />

        {/* Zone 3: Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <ThemeSwitcher />

          <button
            type="button"
            onClick={() => navigate('/tools')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 rounded-lg shadow-sm transition-colors whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Explore Tools</span>
          </button>

          {/* Mobile hamburger button */}
          <button
            type="button"
            onClick={onOpenMobileMenu}
            aria-label="Open navigation menu"
            className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
