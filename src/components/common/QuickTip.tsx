import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface QuickTipProps {
  tip: string;
}

export const QuickTip: React.FC<QuickTipProps> = ({ tip }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-flex items-center ml-1">
      <button
        type="button"
        className="text-slate-400 hover:text-indigo-600 dark:text-slate-500 dark:hover:text-indigo-400 transition-colors"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        aria-label="Quick tip"
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>

      {isVisible && (
        <div className="absolute left-full top-0 ml-2 z-50 w-64 p-3 rounded-lg bg-slate-800 dark:bg-white text-white dark:text-slate-900 text-xs font-medium shadow-xl animate-in fade-in zoom-in-95 duration-100 pointer-events-none">
          {tip}
          <div className="absolute top-2 -left-1 w-2 h-2 bg-slate-800 dark:bg-white rotate-45" />
        </div>
      )}
    </div>
  );
};
