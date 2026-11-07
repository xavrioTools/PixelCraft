import React from 'react';
import { AlertTriangle, RefreshCw, X } from 'lucide-react';

interface ErrorMessageProps {
  title?: string;
  message: string;
  suggestion?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'Processing Error',
  message,
  suggestion,
  onRetry,
  onDismiss,
  className = '',
}) => {
  return (
    <div
      role="alert"
      className={`p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 shadow-sm ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-1 rounded-md bg-rose-100 dark:bg-rose-900/80 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4" />
          </div>

          <div className="space-y-1">
            <h4 className="text-xs font-bold text-rose-900 dark:text-rose-100">
              {title}
            </h4>
            <p className="text-xs text-rose-800 dark:text-rose-300 leading-relaxed">
              {message}
            </p>
            {suggestion && (
              <p className="text-[11px] text-rose-700 dark:text-rose-400 mt-1">
                Tip: {suggestion}
              </p>
            )}

            {onRetry && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onRetry}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-xs"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Try Again</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss error"
            className="p-1 rounded-md text-rose-500 hover:text-rose-800 dark:hover:text-rose-200 hover:bg-rose-100 dark:hover:bg-rose-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
