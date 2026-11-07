import React, { useState } from 'react';
import { Download, FileArchive, Check, Sparkles } from 'lucide-react';
import { formatBytes } from '../../utils/formatters';

interface DownloadComponentProps {
  onDownload: (options: { format: string; quality: number; filename: string }) => void;
  onDownloadZip?: () => void;
  outputSizeBytes?: number;
  originalSizeBytes?: number;
  defaultFormat?: string;
  defaultFilename?: string;
  availableFormats?: string[];
  className?: string;
}

export const DownloadComponent: React.FC<DownloadComponentProps> = ({
  onDownload,
  onDownloadZip,
  outputSizeBytes,
  originalSizeBytes,
  defaultFormat = 'WEBP',
  defaultFilename = 'pixelcraft-optimized',
  availableFormats = ['WEBP', 'PNG', 'JPG', 'AVIF'],
  className = '',
}) => {
  const [selectedFormat, setSelectedFormat] = useState(defaultFormat);
  const [quality, setQuality] = useState(85);
  const [filename, setFilename] = useState(defaultFilename);
  const [hasDownloaded, setHasDownloaded] = useState(false);

  const handleDownloadClick = () => {
    onDownload({
      format: selectedFormat,
      quality: quality / 100,
      filename: `${filename}.${selectedFormat.toLowerCase()}`,
    });
    setHasDownloaded(true);
    setTimeout(() => setHasDownloaded(false), 3000);
  };

  return (
    <div className={`p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6 ${className}`}>
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            Export Settings
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Select target format and compression quality
          </p>
        </div>

        {outputSizeBytes !== undefined && (
          <div className="text-right">
            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
              {formatBytes(outputSizeBytes)}
            </span>
            {originalSizeBytes && originalSizeBytes > outputSizeBytes && (
              <span className="block text-[10px] text-slate-400">
                Reduced from {formatBytes(originalSizeBytes)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Format Selector */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          Target Format
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {availableFormats.map((fmt) => (
            <button
              key={fmt}
              type="button"
              onClick={() => setSelectedFormat(fmt)}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                selectedFormat === fmt
                  ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {fmt}
            </button>
          ))}
        </div>
      </div>

      {/* Quality Slider (for lossy formats) */}
      {selectedFormat !== 'PNG' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <label htmlFor="quality-slider" className="font-semibold text-slate-700 dark:text-slate-300">
              Output Quality
            </label>
            <span className="font-mono tabular-nums text-indigo-600 dark:text-indigo-400 font-bold">
              {quality}%
            </span>
          </div>
          <input
            id="quality-slider"
            type="range"
            min="10"
            max="100"
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value))}
            className="w-full accent-indigo-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>Smaller file</span>
            <span>Balanced</span>
            <span>Maximum quality</span>
          </div>
        </div>
      )}

      {/* File Name input */}
      <div className="space-y-1.5">
        <label htmlFor="filename-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          File Name
        </label>
        <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500">
          <input
            id="filename-input"
            type="text"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-950 text-slate-900 dark:text-white outline-none"
            placeholder="pixelcraft-optimized"
          />
          <span className="px-3 py-2 text-xs font-mono font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700">
            .{selectedFormat.toLowerCase()}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={handleDownloadClick}
          className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-sm transition-all"
        >
          {hasDownloaded ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" />
              <span>Downloaded!</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Download Processed Image</span>
            </>
          )}
        </button>

        {onDownloadZip && (
          <button
            type="button"
            onClick={onDownloadZip}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <FileArchive className="w-4 h-4 text-indigo-500" />
            <span>Download All as ZIP</span>
          </button>
        )}
      </div>

      <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400">
        <Sparkles className="w-3 h-3 text-indigo-400" />
        <span>No watermarks added · Completely free</span>
      </div>
    </div>
  );
};
