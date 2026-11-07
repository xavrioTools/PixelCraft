import React from 'react';
import { Loader2, X } from 'lucide-react';

interface ProcessingLoaderProps {
  progressPercent: number; // 0 to 100
  stepLabel?: string;
  onCancel?: () => void;
  title?: string;
  className?: string;
}

export const ProcessingLoader: React.FC<ProcessingLoaderProps> = ({
  progressPercent,
  stepLabel = 'Processing image in browser memory...',
  onCancel,
  title = 'Processing Image',
  className = '',
}) => {
  const clamped = Math.min(100, Math.max(0, Math.round(progressPercent)));

  return (
    <div
      role="status"
      aria-live="polite"
      className={`p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <Loader2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 animate-spin" />
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
            {title}
          </h4>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono tabular-nums font-semibold text-indigo-600 dark:text-indigo-400">
            {clamped}%
          </span>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              title="Cancel processing"
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
              <span className="sr-only">Cancel processing</span>
            </button>
          )}
        </div>
      </div>

      {/* Progress Track */}
      <div
        className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${clamped}%` }}
        />
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span className="truncate">{stepLabel}</span>
        <span className="shrink-0 text-[11px] text-slate-400 dark:text-slate-500 font-mono">
          Private Client Thread
        </span>
      </div>
    </div>
  );
};
