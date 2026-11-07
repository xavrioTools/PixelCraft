import React, { useState, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Minimize2,
  Crop,
  Maximize2,
  Wand2,
  ArrowRight,
  FileCheck,
  X,
} from 'lucide-react';
import { validateImageFile, formatBytes, getAspectRatioString, formatMimeType } from '../../utils/formatters';
import { useSharedImage, SharedImageData } from '../../context/SharedImageContext';
import { useRouter } from '../../context/RouterContext';

export const QuickUploadSection: React.FC = () => {
  const { navigate } = useRouter();
  const { setSharedImage } = useSharedImage();

  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedData, setUploadedData] = useState<SharedImageData | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const validation = validateImageFile(file, { maxBytes: 50 * 1024 * 1024 });
    if (!validation.valid) {
      setError(validation.error || 'Invalid image file.');
      return;
    }

    setError(null);
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.src = url;
    img.onload = () => {
      const data: SharedImageData = {
        file,
        url,
        name: file.name,
        sizeBytes: file.size,
        width: img.width,
        height: img.height,
        format: formatMimeType(file.type || 'image/png'),
        aspectRatio: getAspectRatioString(img.width, img.height),
      };
      setUploadedData(data);
    };
    img.onerror = () => {
      setError('Could not decode image file.');
    };
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const loadSample = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1600;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Beautiful gradient background
      const grad = ctx.createLinearGradient(0, 0, 1600, 1000);
      grad.addColorStop(0, '#312e81');
      grad.addColorStop(0.5, '#4f46e5');
      grad.addColorStop(1, '#7c3aed');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1600, 1000);

      // Geometric glass layer
      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.beginPath();
      ctx.arc(800, 500, 320, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.beginPath();
      ctx.roundRect(500, 320, 600, 360, 32);
      ctx.fill();

      // Text label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 54px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('PixelCraft Pro Studio', 800, 480);

      ctx.font = '28px sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fillText('1600 × 1000px · 16:9 Ultra HD Sample', 800, 540);

      canvas.toBlob((blob) => {
        if (blob) {
          const sampleFile = new File([blob], 'pixelcraft-sample.png', { type: 'image/png' });
          handleFile(sampleFile);
        }
      }, 'image/png');
    }
  };

  const handleSelectTool = (path: string) => {
    if (!uploadedData) return;
    // Preserve the image in client context without automatic processing
    setSharedImage(uploadedData);
    navigate(path);
  };

  const clearSelection = () => {
    setUploadedData(null);
    setError(null);
  };

  return (
    <div className="w-full">

{/* NativeBanner_1 4:1 */}
<script async="async" data-cfasync="false" src="https://crypotential.com/6de8cb71d409fab9ac244d9e54d15fb0/invoke.js"></script>
<div id="container-6de8cb71d409fab9ac244d9e54d15fb0"></div>

      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
          <Upload className="w-3.5 h-3.5" />
          <span>Instant In-Browser Upload</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Drop Any Image to Get Started
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Upload first, then choose your tool. Zero server uploads — 100% processed in your browser.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        {!uploadedData ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDragging(false);
            }}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            aria-label="Upload image area"
            className={`relative flex flex-col items-center justify-center p-8 sm:p-12 rounded-3xl border-2 border-dashed transition-all cursor-pointer text-center bg-white dark:bg-slate-900 shadow-sm ${
              isDragging
                ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 dark:border-indigo-500 scale-[0.99]'
                : 'border-slate-300 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-slate-50/50 dark:hover:bg-slate-900/80'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml,image/gif,image/bmp,image/tiff"
              className="sr-only"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFile(e.target.files[0]);
                }
              }}
            />

            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 shadow-xs">
              <Upload className="w-7 h-7" />
            </div>

            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Drag & Drop Your Image Here, or Click to Browse
            </h3>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-md">
              Supports JPG, PNG, WebP, AVIF, SVG, GIF, BMP, and TIFF up to 50MB.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors">
                <ImageIcon className="w-4 h-4" />
                <span>Browse Files</span>
              </span>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  loadSample();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Try Sample Image</span>
              </button>
            </div>
          </div>
        ) : (
          /* Uploaded Preview & Tool Selection Card */
          <div className="p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <FileCheck className="w-4 h-4" />
                <span>File Validated & Ready</span>
              </div>

              <button
                type="button"
                onClick={clearSelection}
                className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
                <span>Choose Different Image</span>
              </button>
            </div>

            {/* Preview and Metadata Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Thumbnail */}
              <div className="relative rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center p-3 h-48 sm:h-56">
                <img
                  src={uploadedData.url}
                  alt={uploadedData.name}
                  className="max-h-full max-w-full object-contain rounded-lg shadow-sm"
                />
              </div>

              {/* Metadata Details */}
              <div className="md:col-span-2 space-y-4">
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white truncate">
                    {uploadedData.name}
                  </h4>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Original Input Buffer
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80">
                    <span className="block text-[11px] text-slate-400 uppercase font-semibold">Format</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                      {uploadedData.format}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80">
                    <span className="block text-[11px] text-slate-400 uppercase font-semibold">File Size</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 font-mono tabular-nums">
                      {formatBytes(uploadedData.sizeBytes)}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80">
                    <span className="block text-[11px] text-slate-400 uppercase font-semibold">Dimensions</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 font-mono tabular-nums">
                      {uploadedData.width} × {uploadedData.height}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80">
                    <span className="block text-[11px] text-slate-400 uppercase font-semibold">Aspect Ratio</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                      {uploadedData.aspectRatio}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Select a tool below to open its workspace with this image pre-loaded.
                </div>
              </div>
            </div>

            {/* Tool Selection Buttons */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Choose Action for This Image
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => handleSelectTool('/convert')}
                  className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/40 text-center transition-all group"
                >
                  <RefreshCw className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Convert</span>
                  <span className="text-[10px] text-slate-400">To WebP, PNG, etc.</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectTool('/compress')}
                  className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/40 text-center transition-all group"
                >
                  <Minimize2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Compress</span>
                  <span className="text-[10px] text-slate-400">Shrink file size</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectTool('/crop')}
                  className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/40 text-center transition-all group"
                >
                  <Crop className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Crop</span>
                  <span className="text-[10px] text-slate-400">Aspect ratios</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectTool('/resize')}
                  className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/40 text-center transition-all group"
                >
                  <Maximize2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Resize</span>
                  <span className="text-[10px] text-slate-400">Scale dimensions</span>
                </button>

              
              </div>
            </div>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mt-4 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center gap-2.5 text-xs text-rose-700 dark:text-rose-300"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};
