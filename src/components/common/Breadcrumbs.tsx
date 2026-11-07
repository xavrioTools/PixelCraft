import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { BreadcrumbItem } from '../../types/tools';
import { useRouter } from '../../context/RouterContext';

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => {
  const router = useRouter();
  const list = items || router.breadcrumbs;

  if (list.length <= 1) return null;

  return (
    <nav
      aria-label="Breadcrumbs"
      className={`flex items-center text-xs text-slate-500 dark:text-slate-400 overflow-x-auto py-2 whitespace-nowrap ${className}`}
    >
      <ol className="flex items-center gap-1.5 list-none p-0 m-0">
        {list.map((item, index) => {
          const isFirst = index === 0;
          const isLast = index === list.length - 1 || item.current;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              {!isFirst && (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 shrink-0" aria-hidden="true" />
              )}
              {isLast ? (
                <span
                  className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[200px]"
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => item.href && router.navigate(item.href)}
                  className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus:outline-none focus-visible:underline"
                >
                  {isFirst && <Home className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
                  <span>{item.label}</span>
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
