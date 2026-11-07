import React from 'react';
import { useRouter } from '../../context/RouterContext';

export interface NavItem {
  label: string;
  href: string;
}

export const MAIN_NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'All Tools', href: '/tools' },
  { label: 'Batch Studio', href: '/batch' },
  { label: 'Converter', href: '/convert' },
  { label: 'Compressor', href: '/compress' },
  { label: 'About Us', href: '/about' },
];

export const DesktopNavigation: React.FC = () => {
  const { currentPath, navigate } = useRouter();

  const isItemActive = (href: string) => {
    if (href === '/') return currentPath === '/';
    return currentPath === href || currentPath.startsWith(`${href}/`);
  };

  return (
    <nav
      aria-label="Desktop Primary Navigation"
      className="hidden md:flex items-center gap-1 lg:gap-2 text-sm font-medium"
    >
      {MAIN_NAV_ITEMS.map((item) => {
        const active = isItemActive(item.href);
        return (
          <button
            key={item.href}
            type="button"
            onClick={() => navigate(item.href)}
            className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 text-sm ${
              active
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50/70 dark:bg-indigo-950/40'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-slate-800/60'
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </nav>
  );
};
