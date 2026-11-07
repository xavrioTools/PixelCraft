import React from 'react';
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';
import { BatchQueueItem } from '../views/BatchView';
import { formatBytes } from '../../utils/formatters';

export interface BatchProgressIndicatorProps {
  queue: BatchQueueItem[];
  isProcessing: boolean;
  overallProgress: number;
  activeToolName: string;
  onCancel?: () => void;
  className?: string;
}

export const BatchProgressIndicator: React.FC<BatchProgressIndicatorProps> = ({
  queue,
  isProcessing,
  overallProgress,
  activeToolName,
  onCancel,
  className = '',
}) => {
  const total = queue.length;
  if (total === 0) return null;

  const completed = queue.filter((i) => i.status === 'completed').length;
  const processing = queue.filter((i) => i.status === 'processing').length;
  const errors = queue.filter((i) => i.status === 'error').length;
  const pending = Math.max(0, total - completed - processing - errors);

  const clampedProgress = Math.min(100, Math.max(0, Math.round(overallProgress)));

  const totalSavedBytes = queue.reduce((acc, i) => {
    if (i.processedResult) {
      const diff = i.sizeBytes - i.processedResult.sizeBytes;
      return acc + (diff > 0 ? diff : 0);
    }
    return acc;
  }, 0);

  const activeItem = queue.find((i) => i.status === 'processing');

  return (
    <div
      role="region"
      aria-label="Batch progress indicator"
      className={`p-5 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-white dark:bg-slate-900 shadow-sm space-y-4 ${className}`}
    >
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            {isProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : completed === total ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            ) : (
              <Layers className="w-5 h-5" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span className="uppercase tracking-wider">{activeToolName} Batch</span>
              <span aria-hidden="true">·</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-mono tabular-nums">
                {completed} of {total} Complete
              </span>
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>
                {isProcessing
                  ? `Processing Batch (${clampedProgress}%)`
                  : completed === total
                  ? 'Batch Processing Complete'
                  : 'Batch Processing Ready'}
              </span>
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-2xl font-black font-mono tabular-nums text-indigo-600 dark:text-indigo-400">
            {clampedProgress}%
          </span>
          {onCancel && isProcessing && (
            <button
              type="button"
              onClick={onCancel}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Cancel batch run"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Continuous Visual Progress Bar */}
      <div className="space-y-1.5">
        <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative p-0.5">
          {/* Base continuous progress fill */}
          <div
            className="h-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 rounded-full transition-all duration-300 ease-out shadow-xs"
            style={{ width: `${clampedProgress}%` }}
          />
        </div>

        {/* Micro-Segmented Queue Breakdown Visual Bar */}
        <div className="flex h-1.5 w-full rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
          {completed > 0 && (
            <div
              className="bg-emerald-500 transition-all duration-300"
              style={{ width: `${(completed / total) * 100}%` }}
              title={`${completed} Completed`}
            />
          )}
          {processing > 0 && (
            <div
              className="bg-indigo-500 animate-pulse transition-all duration-300"
              style={{ width: `${(processing / total) * 100}%` }}
              title={`${processing} Processing`}
            />
          )}
          {errors > 0 && (
            <div
              className="bg-rose-500 transition-all duration-300"
              style={{ width: `${(errors / total) * 100}%` }}
              title={`${errors} Failed`}
            />
          )}
          {pending > 0 && (
            <div
              className="bg-slate-200 dark:bg-slate-700 transition-all duration-300"
              style={{ width: `${(pending / total) * 100}%` }}
              title={`${pending} Pending`}
            />
          )}
        </div>
      </div>

      {/* Real-time Task Metadata Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-xs">
        <div className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Completed</span>
          </div>
          <div className="mt-1 font-mono text-sm font-bold tabular-nums text-slate-900 dark:text-white">
            {completed} <span className="text-[11px] font-sans font-normal text-slate-400">/ {total}</span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-indigo-500" />
            <span>Active Worker</span>
          </div>
          <div className="mt-1 font-mono text-sm font-bold tabular-nums text-slate-900 dark:text-white">
            {processing > 0 ? `${processing} Parallel` : 'Idle'}
          </div>
        </div>

        <div className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Queue Remaining</span>
          </div>
          <div className="mt-1 font-mono text-sm font-bold tabular-nums text-slate-900 dark:text-white">
            {pending} items
          </div>
        </div>

        <div className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            <span>Space Saved</span>
          </div>
          <div className="mt-1 font-mono text-sm font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
            {totalSavedBytes > 0 ? formatBytes(totalSavedBytes) : '0 KB'}
          </div>
        </div>
      </div>

      {/* Active File Ticker */}
      {isProcessing && activeItem && (
        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 pt-1">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shrink-0" />
          <span className="truncate">
            Processing item: <span className="font-semibold text-slate-700 dark:text-slate-300">{activeItem.name}</span> ({activeItem.width}×{activeItem.height}px)
          </span>
        </div>
      )}
    </div>
  );
};
