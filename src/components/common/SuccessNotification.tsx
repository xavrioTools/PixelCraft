import React from 'react';
import { CheckCircle2, Download, X } from 'lucide-react';

interface SuccessNotificationProps {
  title?: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export const SuccessNotification: React.FC<SuccessNotificationProps> = ({
  title = 'Success!',
  message,
  actionLabel,
  onAction,
  onDismiss,
  className = '',
}) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 shadow-sm ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-1 rounded-md bg-emerald-100 dark:bg-emerald-900/80 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
            <CheckCircle2 className="w-4 h-4" />
          </div>

          <div className="space-y-1">
            <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-100">
              {title}
            </h4>
            <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
              {message}
            </p>

            {onAction && actionLabel && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onAction}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
                >
                  <Download className="w-3 h-3" />
                  <span>{actionLabel}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss notification"
            className="p-1 rounded-md text-emerald-500 hover:text-emerald-800 dark:hover:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
