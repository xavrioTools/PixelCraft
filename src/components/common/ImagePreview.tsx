import React, { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Columns, SplitSquareVertical, Eye, Maximize2 } from 'lucide-react';
import { formatBytes, calculateSavings } from '../../utils/formatters';

interface ImagePreviewProps {
  originalUrl: string;
  processedUrl?: string;
  originalSizeBytes?: number;
  processedSizeBytes?: number;
  width?: number;
  height?: number;
  format?: string;
  title?: string;
  className?: string;
  onQuickView?: () => void;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  originalUrl,
  processedUrl,
  originalSizeBytes,
  processedSizeBytes,
  width,
  height,
  format,
  title,
  className = '',
  onQuickView,
}) => {
  const [zoom, setZoom] = useState(1);
  const [viewMode, setViewMode] = useState<'split' | 'side-by-side' | 'single'>(
    processedUrl ? 'split' : 'single'
  );
  const [splitPos, setSplitPos] = useState(50); // percentage 0-100

  const handleZoomIn = () => setZoom((z) => Math.min(3, +(z + 0.25).toFixed(2)));
  const handleZoomOut = () => setZoom((z) => Math.max(0.5, +(z - 0.25).toFixed(2)));
  const handleResetZoom = () => setZoom(1);

  const savings =
    originalSizeBytes && processedSizeBytes
      ? calculateSavings(originalSizeBytes, processedSizeBytes)
      : null;

  return (
    <div className={`flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm ${className}`}>
      {/* Top Preview Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {title || 'Image Preview'}
          </span>
          {processedUrl && (
            <span className="text-slate-400 dark:text-slate-500">· Comparing Outputs</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {processedUrl && (
            <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-800 p-0.5 bg-white dark:bg-slate-950">
              <button
                type="button"
                onClick={() => setViewMode('split')}
                title="Split slider view"
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'split'
                    ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-medium'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <SplitSquareVertical className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('side-by-side')}
                title="Side by side view"
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'side-by-side'
                    ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-medium'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('single')}
                title="Single view"
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'single'
                    ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-medium'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Zoom controls */}
          <div className="inline-flex items-center rounded-lg border border-slate-200 dark:border-slate-800 p-0.5 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400">
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
              title="Zoom Out"
              className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-mono text-[11px] tabular-nums text-slate-700 dark:text-slate-300">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              disabled={zoom >= 3}
              title="Zoom In"
              className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              title="Reset Zoom"
              className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 border-l border-slate-200 dark:border-slate-800 ml-0.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            {onQuickView && (
              <button
                type="button"
                onClick={onQuickView}
                title="Fullscreen Quick View (Zoom & Pan)"
                className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 border-l border-slate-200 dark:border-slate-800 ml-0.5 text-indigo-600 dark:text-indigo-400 font-bold"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Canvas Viewport Area */}
      <div className="relative w-full min-h-[360px] max-h-[540px] bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] bg-slate-100/50 dark:bg-slate-950/50 flex items-center justify-center p-4 overflow-hidden select-none">
        {/* Single View */}
        {(viewMode === 'single' || !processedUrl) && (
          <div
            className="transition-transform duration-100 ease-out flex items-center justify-center max-w-full max-h-full"
            style={{ transform: `scale(${zoom})` }}
          >
            <div className="rounded-lg overflow-hidden shadow-md border border-slate-200/80 dark:border-slate-800 bg-[linear-gradient(45deg,#cbd5e1_25%,transparent_25%),linear-gradient(-45deg,#cbd5e1_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#cbd5e1_75%),linear-gradient(-45deg,transparent_75%,#cbd5e1_75%)] dark:bg-[linear-gradient(45deg,#1e293b_25%,transparent_25%),linear-gradient(-45deg,#1e293b_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#1e293b_75%),linear-gradient(-45deg,transparent_75%,#1e293b_75%)] [background-size:16px_16px] [background-position:0_0,0_8px,8px_-8px,-8px_0px]">
              <img
                src={processedUrl || originalUrl}
                alt="Preview"
                className="max-h-[460px] max-w-full object-contain block"
              />
            </div>
          </div>
        )}

        {/* Side by Side View */}
        {viewMode === 'side-by-side' && processedUrl && (
          <div
            className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[480px] overflow-auto transition-transform duration-100"
            style={{ transform: `scale(${zoom})` }}
          >
            <div className="flex flex-col items-center">
              <span className="text-[11px] font-semibold text-slate-500 mb-1.5">Original</span>
              <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-[linear-gradient(45deg,#cbd5e1_25%,transparent_25%),linear-gradient(-45deg,#cbd5e1_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#cbd5e1_75%),linear-gradient(-45deg,transparent_75%,#cbd5e1_75%)] dark:bg-[linear-gradient(45deg,#1e293b_25%,transparent_25%),linear-gradient(-45deg,#1e293b_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#1e293b_75%),linear-gradient(-45deg,transparent_75%,#1e293b_75%)] [background-size:16px_16px] [background-position:0_0,0_8px,8px_-8px,-8px_0px]">
                <img
                  src={originalUrl}
                  alt="Original"
                  className="max-h-[380px] object-contain block"
                />
              </div>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 mb-1.5">
                Processed ({format || 'Optimized'})
              </span>
              <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-[linear-gradient(45deg,#cbd5e1_25%,transparent_25%),linear-gradient(-45deg,#cbd5e1_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#cbd5e1_75%),linear-gradient(-45deg,transparent_75%,#cbd5e1_75%)] dark:bg-[linear-gradient(45deg,#1e293b_25%,transparent_25%),linear-gradient(-45deg,#1e293b_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#1e293b_75%),linear-gradient(-45deg,transparent_75%,#1e293b_75%)] [background-size:16px_16px] [background-position:0_0,0_8px,8px_-8px,-8px_0px]">
                <img
                  src={processedUrl}
                  alt="Processed"
                  className="max-h-[380px] object-contain block"
                />
              </div>
            </div>
          </div>
        )}

        {/* Split Slider View */}
        {viewMode === 'split' && processedUrl && (
          <div
            className="relative max-w-full max-h-[460px] overflow-hidden rounded-lg shadow-md border border-slate-200/60 dark:border-slate-800/60 transition-transform duration-100 bg-[linear-gradient(45deg,#cbd5e1_25%,transparent_25%),linear-gradient(-45deg,#cbd5e1_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#cbd5e1_75%),linear-gradient(-45deg,transparent_75%,#cbd5e1_75%)] dark:bg-[linear-gradient(45deg,#1e293b_25%,transparent_25%),linear-gradient(-45deg,#1e293b_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#1e293b_75%),linear-gradient(-45deg,transparent_75%,#1e293b_75%)] [background-size:16px_16px] [background-position:0_0,0_8px,8px_-8px,-8px_0px]"
            style={{ transform: `scale(${zoom})` }}
          >
            {/* Background: Original Image */}
            <img
              src={originalUrl}
              alt="Original Background"
              className="max-h-[440px] max-w-full object-contain block"
            />

            {/* Foreground: Processed image clipped */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ clipPath: `inset(0 0 0 ${splitPos}%)` }}
            >
              <img
                src={processedUrl}
                alt="Processed Foreground"
                className="max-h-[440px] max-w-full object-contain block w-full h-full"
              />
            </div>

            {/* Vertical Split Line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg cursor-ew-resize flex items-center justify-center"
              style={{ left: `${splitPos}%` }}
            >
              <div className="w-6 h-6 rounded-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-md flex items-center justify-center text-[10px] text-slate-700 dark:text-slate-200 font-bold">
                ⇄
              </div>
            </div>

            {/* Labels overlay */}
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-semibold bg-black/60 text-white backdrop-blur-xs">
              Original
            </div>
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-600/80 text-white backdrop-blur-xs">
              Optimized
            </div>

            {/* Slider range input overlay */}
            <input
              type="range"
              min="0"
              max="100"
              value={splitPos}
              onChange={(e) => setSplitPos(Number(e.target.value))}
              className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full"
              aria-label="Split comparison slider"
            />
          </div>
        )}
      </div>

      {/* Metadata Inspector Bottom Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 font-mono tabular-nums">
        <div className="flex items-center gap-3">
          {originalSizeBytes !== undefined && (
            <div>
              <span className="font-sans text-[11px] text-slate-400 mr-1">Original:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {formatBytes(originalSizeBytes)}
              </span>
            </div>
          )}

          {processedSizeBytes !== undefined && (
            <div>
              <span className="font-sans text-[11px] text-slate-400 mr-1">Optimized:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {formatBytes(processedSizeBytes)}
              </span>
            </div>
          )}

          {savings && savings.percent > 0 && (
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
              -{savings.percent}% ({formatBytes(savings.savedBytes)} saved)
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          {width && height && (
            <div>
              <span className="font-sans text-slate-400 mr-1">Dimensions:</span>
              <span>
                {width} × {height} px
              </span>
            </div>
          )}
          {format && (
            <div>
              <span className="font-sans text-slate-400 mr-1">Format:</span>
              <span className="uppercase font-semibold text-slate-700 dark:text-slate-300">
                {format}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
