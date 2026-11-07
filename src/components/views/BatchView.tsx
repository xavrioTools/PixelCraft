import React, { useState, useEffect, useRef } from 'react';
import {
  Layers,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Sliders,
  Trash2,
  Download,
  Archive,
  Grid,
  List,
  Eye,
  Plus,
  Play,
  Wand2,
  Minimize2,
  Maximize2,
  Crop,
  AlertCircle,
  FileCode2,
  Lock,
  Unlock,
  Palette,
  Upload,
  Check,
  CheckSquare,
  Square,
  Keyboard,
  Command,
} from 'lucide-react';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { FileUpload } from '../common/FileUpload';
import { ImagePreview } from '../common/ImagePreview';
import { ProcessingLoader } from '../common/ProcessingLoader';
import { BatchProgressIndicator } from '../common/BatchProgressIndicator';
import { QuickViewModal } from '../common/QuickViewModal';
import { DownloadComponent } from '../common/DownloadComponent';
import { SuccessNotification } from '../common/SuccessNotification';
import { ErrorMessage } from '../common/ErrorMessage';
import { FaqAccordion } from '../common/FaqAccordion';
import { RelatedToolsSection } from '../common/RelatedToolsSection';
import { formatBytes } from '../../utils/formatters';
import { downloadZipArchive } from '../../utils/zipExporter';
import { ExifInfoPanel } from '../common/ExifInfoPanel';
import {
  executeCrop,
  executeResize,
  executeBackgroundRemoval,
  executeCompressionOrConversion,
  ProcessedImageResult,
  ClarityPreset,
  CustomBackgroundType,
} from '../../utils/imageProcessors';

export interface BatchQueueItem {
  id: string;
  file: File;
  originalUrl: string;
  name: string;
  sizeBytes: number;
  width: number;
  height: number;
  status: 'idle' | 'processing' | 'completed' | 'error';
  progress: number;
  errorMessage?: string;
  processedResult?: ProcessedImageResult;
}

export type BatchToolId = 'convert' | 'compress' | 'resize' | 'crop';

export function BatchView() {
  const [queue, setQueue] = useState<BatchQueueItem[]>([]);
  const [activeTool, setActiveTool] = useState<BatchToolId>('convert');
  const [viewLayout, setViewLayout] = useState<'grid' | 'list'>('grid');

  // Overall batch state
  const [isProcessingAll, setIsProcessingAll] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const [notification, setNotification] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Selected item for preview modal & quick view
  const [inspectItem, setInspectItem] = useState<BatchQueueItem | null>(null);
  const [quickViewItem, setQuickViewItem] = useState<BatchQueueItem | null>(null);

  // Multi-item selection state for keyboard shortcuts & batch operations
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // GLOBAL BATCH PARAMETERS
  const [targetFormat, setTargetFormat] = useState<'WEBP' | 'PNG' | 'JPG' | 'AVIF'>('WEBP');
  const [quality, setQuality] = useState<number>(85); // 10 to 100

  // Resizing parameters
  const [resizeMode, setResizeMode] = useState<'scale' | 'dimensions'>('scale');
  const [scalePercent, setScalePercent] = useState<number>(50);
  const [targetWidth, setTargetWidth] = useState<number>(800);
  const [targetHeight, setTargetHeight] = useState<number>(600);
  const [lockAspectRatio, setLockAspectRatio] = useState<boolean>(true);

  // Cropping parameters
  const [cropRatio, setCropRatio] = useState<'free' | '1:1' | '16:9' | '4:3' | '9:16' | '2:3'>('16:9');
  const [clarityPreset, setClarityPreset] = useState<ClarityPreset>('crisp');
  const [colorFilter, setColorFilter] = useState<'none' | 'grayscale' | 'sepia'>('none');

  // Quick action preset handler
  const applyQuickPreset = (preset: 'instagram-square' | 'youtube-thumbnail' | 'web-compressed' | 'grayscale' | 'avif-ultra') => {
    if (preset === 'instagram-square') {
      setActiveTool('crop');
      setCropRatio('1:1');
      setTargetFormat('WEBP');
      setQuality(90);
      setColorFilter('none');
      setNotification(`Applied 'Instagram Square (1:1)' preset across all ${queue.length} items.`);
    } else if (preset === 'youtube-thumbnail') {
      setActiveTool('resize');
      setResizeMode('dimensions');
      setTargetWidth(1280);
      setTargetHeight(720);
      setTargetFormat('JPG');
      setQuality(88);
      setColorFilter('none');
      setNotification(`Applied 'YouTube Thumbnail (1280x720)' preset across all ${queue.length} items.`);
    } else if (preset === 'web-compressed') {
      setActiveTool('compress');
      setTargetFormat('WEBP');
      setQuality(80);
      setColorFilter('none');
      setNotification(`Applied 'Web Compressed (WEBP 80%)' preset across all ${queue.length} items.`);
    } else if (preset === 'grayscale') {
      setColorFilter('grayscale');
      setNotification(`Applied 'Grayscale / Monochromatic' filter preset across all ${queue.length} items.`);
    } else if (preset === 'avif-ultra') {
      setActiveTool('convert');
      setTargetFormat('AVIF');
      setQuality(85);
      setColorFilter('none');
      setNotification(`Applied 'AVIF Ultra Efficiency' preset across all ${queue.length} items.`);
    }
  };

  // Background Remover parameters
  // const [bgMode, setBgMode] = useState<'auto' | 'custom-color' | 'white-backdrop' | 'green-screen' | 'black-backdrop'>('auto');
  // const [bgScope, setBgScope] = useState<'perimeter' | 'global'>('perimeter');
  // const [bgSensitivity, setBgSensitivity] = useState(35);
  // const [bgFeather, setBgFeather] = useState(2);
  // const [bgReplacerTab, setBgReplacerTab] = useState<CustomBackgroundType>('transparent');
  // const [customBgColor, setCustomBgColor] = useState('#4F46E5');
  // const [customBgGradient, setCustomBgGradient] = useState('indigo-glow');
  // const [customBgImageUrl, setCustomBgImageUrl] = useState<string | null>(null);
  // const [bgBlur, setBgBlur] = useState(0);

  // Full workspace drag-and-drop zone state
  const [isDragActive, setIsDragActive] = useState(false);
  const dragCounterRef = useRef(0);

  const handleWorkspaceDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragActive(true);
    }
  };

  const handleWorkspaceDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0;
      setIsDragActive(false);
    }
  };

  const handleWorkspaceDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleWorkspaceDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    dragCounterRef.current = 0;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith('image/')
      );
      if (droppedFiles.length > 0) {
        handleBatchSelect(droppedFiles);
      } else {
        setErrorMessage('Please drop valid image files (JPG, PNG, WEBP, AVIF, SVG).');
      }
    }
  };

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      queue.forEach((item) => {
        URL.revokeObjectURL(item.originalUrl);
        if (item.processedResult) {
          URL.revokeObjectURL(item.processedResult.url);
        }
      });
    };
  }, []);

  const handleBatchSelect = (files: File[]) => {
    setErrorMessage(null);
    const newItems: BatchQueueItem[] = [];

    let loadedCount = 0;
    files.forEach((file) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.src = url;
      img.onload = () => {
        loadedCount++;
        newItems.push({
          id: `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          file,
          originalUrl: url,
          name: file.name,
          sizeBytes: file.size,
          width: img.width,
          height: img.height,
          status: 'idle',
          progress: 0,
        });

        if (loadedCount === files.length) {
          setQueue((prev) => [...prev, ...newItems]);
          setNotification(`Added ${files.length} images to batch queue. Ready to process.`);
        }
      };

      img.onerror = () => {
        loadedCount++;
        if (loadedCount === files.length && newItems.length > 0) {
          setQueue((prev) => [...prev, ...newItems]);
        }
      };
    });
  };

  const removeItem = (id: string) => {
    setQueue((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) {
        URL.revokeObjectURL(item.originalUrl);
        if (item.processedResult) URL.revokeObjectURL(item.processedResult.url);
      }
      return prev.filter((i) => i.id !== id);
    });
    setSelectedIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const clearQueue = () => {
    queue.forEach((item) => {
      URL.revokeObjectURL(item.originalUrl);
      if (item.processedResult) URL.revokeObjectURL(item.processedResult.url);
    });
    setQueue([]);
    setSelectedIds(new Set());
    setNotification(null);
    setErrorMessage(null);
    setOverallProgress(0);
  };

  // Selection handlers
  const toggleSelectItem = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(queue.map((item) => item.id)));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const removeSelectedItems = () => {
    if (selectedIds.size === 0) return;
    const count = selectedIds.size;
    setQueue((prev) => {
      prev.forEach((item) => {
        if (selectedIds.has(item.id)) {
          URL.revokeObjectURL(item.originalUrl);
          if (item.processedResult) URL.revokeObjectURL(item.processedResult.url);
        }
      });
      return prev.filter((item) => !selectedIds.has(item.id));
    });
    setSelectedIds(new Set());
    setNotification(`Removed ${count} selected item${count > 1 ? 's' : ''} from queue.`);
  };

  // Process a single item based on active global parameters
  const processSingleItem = async (item: BatchQueueItem): Promise<ProcessedImageResult> => {
    const mimeMap: Record<string, string> = {
      WEBP: 'image/webp',
      PNG: 'image/png',
      JPG: 'image/jpeg',
      AVIF: 'image/avif',
    };
    const targetMime = mimeMap[targetFormat] || 'image/webp';
    const qVal = quality / 100;

    if (activeTool === 'convert' || activeTool === 'compress') {
      return executeCompressionOrConversion(item.originalUrl, targetMime, qVal, colorFilter);
    } else if (activeTool === 'resize') {
      let w = targetWidth;
      let h = targetHeight;
      if (resizeMode === 'scale') {
        w = Math.max(1, Math.round(item.width * (scalePercent / 100)));
        h = Math.max(1, Math.round(item.height * (scalePercent / 100)));
      }
      return executeResize(item.originalUrl, w, h, targetMime, qVal, clarityPreset, colorFilter);
    } else if (activeTool === 'crop') {
      let aspectNum = 1;
      if (cropRatio === '16:9') aspectNum = 16 / 9;
      else if (cropRatio === '4:3') aspectNum = 4 / 3;
      else if (cropRatio === '9:16') aspectNum = 9 / 16;
      else if (cropRatio === '2:3') aspectNum = 2 / 3;

      let cw = Math.round(item.width * 0.85);
      let ch = Math.round(cw / aspectNum);
      if (ch > item.height * 0.85) {
        ch = Math.round(item.height * 0.85);
        cw = Math.round(ch * aspectNum);
      }
      const cx = Math.max(0, Math.round((item.width - cw) / 2));
      const cy = Math.max(0, Math.round((item.height - ch) / 2));

      return executeCrop(
        item.originalUrl,
        { x: cx, y: cy, width: cw, height: ch },
        targetMime,
        qVal,
        clarityPreset,
        colorFilter
      );
    }

    return executeCompressionOrConversion(item.originalUrl, 'image/webp', 0.85);
  };

  // Run all batch items with concurrency limit = 4
  const runBatchProcessing = async () => {
    if (queue.length === 0) return;
    setIsProcessingAll(true);
    setOverallProgress(5);
    setErrorMessage(null);

    const CONCURRENCY_LIMIT = 4;
    let completedCount = 0;

    // Reset status of all queue items
    setQueue((prev) =>
      prev.map((item) => ({ ...item, status: 'idle', progress: 0, errorMessage: undefined }))
    );

    const itemIds = queue.map((i) => i.id);

    // Queue worker executor
    const processPool = async () => {
      for (let i = 0; i < itemIds.length; i += CONCURRENCY_LIMIT) {
        const chunk = itemIds.slice(i, i + CONCURRENCY_LIMIT);

        await Promise.all(
          chunk.map(async (id) => {
            setQueue((prev) =>
              prev.map((item) => (item.id === id ? { ...item, status: 'processing', progress: 40 } : item))
            );

            const targetItem = queue.find((item) => item.id === id);
            if (!targetItem) return;

            try {
              const res = await processSingleItem(targetItem);
              completedCount++;
              setQueue((prev) =>
                prev.map((item) =>
                  item.id === id
                    ? {
                        ...item,
                        status: 'completed',
                        progress: 100,
                        processedResult: res,
                      }
                    : item
                )
              );
            } catch (err: unknown) {
              completedCount++;
              const msg = err instanceof Error ? err.message : String(err);
              setQueue((prev) =>
                prev.map((item) =>
                  item.id === id
                    ? {
                        ...item,
                        status: 'error',
                        progress: 0,
                        errorMessage: msg,
                      }
                    : item
                )
              );
            }

            const pct = Math.round((completedCount / queue.length) * 100);
            setOverallProgress(pct);
          })
        );
      }
    };

    try {
      await processPool();
      setIsProcessingAll(false);
      setOverallProgress(100);
      setNotification(`Batch processing completed for ${queue.length} images! Download ZIP or individual files below.`);
    } catch (err: unknown) {
      setIsProcessingAll(false);
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(`Batch processing failed: ${msg}`);
    }
  };

  // Export entire batch as ZIP archive
  const handleDownloadZip = async () => {
    const completedItems = queue.filter((i) => i.status === 'completed' && i.processedResult);
    if (completedItems.length === 0) {
      setErrorMessage('No completed batch items available to download.');
      return;
    }

    try {
      const zipEntries = completedItems.map((item, idx) => {
        const ext = item.processedResult?.format.toLowerCase() || 'png';
        const baseName = item.name.replace(/\.[^/.]+$/, '');
        const filename = `${baseName}-${activeTool}-${idx + 1}.${ext}`;
        return {
          filename,
          blob: item.processedResult!.blob,
        };
      });

      await downloadZipArchive(zipEntries, `pixelcraft-batch-${activeTool}-${Date.now()}.zip`);
      setNotification(`Downloaded ZIP archive with ${zipEntries.length} processed images.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(`ZIP export failed: ${msg}`);
    }
  };

  // Download single item
  const handleSingleDownload = (item: BatchQueueItem) => {
    if (!item.processedResult) return;
    const ext = item.processedResult.format.toLowerCase();
    const baseName = item.name.replace(/\.[^/.]+$/, '');
    const filename = `${baseName}-${activeTool}.${ext}`;

    const link = document.createElement('a');
    link.href = item.processedResult.url;
    link.download = filename;
    link.click();
  };

  const completedCount = queue.filter((i) => i.status === 'completed').length;
  const totalSavedBytes = queue.reduce((acc, i) => {
    if (i.processedResult) {
      const diff = i.sizeBytes - i.processedResult.sizeBytes;
      return acc + (diff > 0 ? diff : 0);
    }
    return acc;
  }, 0);

  // Keyboard shortcut listener for efficient batch workflow
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in form controls
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // Ctrl+A / Cmd+A: Select All
      if (cmdOrCtrl && (e.key === 'a' || e.key === 'A')) {
        if (queue.length > 0) {
          e.preventDefault();
          selectAll();
        }
        return;
      }

      // Delete / Backspace: Remove selected
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedIds.size > 0 && !quickViewItem && !inspectItem) {
          e.preventDefault();
          removeSelectedItems();
        }
        return;
      }

      // Ctrl+S / Cmd+S: Initiate batch download
      if (cmdOrCtrl && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        const completedItems = queue.filter((i) => i.status === 'completed' && i.processedResult);
        if (completedItems.length > 0) {
          handleDownloadZip();
        } else {
          setNotification('No completed items to download yet. Run batch processing first!');
        }
        return;
      }

      // Ctrl+Enter / Cmd+Enter: Process entire batch
      if (cmdOrCtrl && e.key === 'Enter') {
        e.preventDefault();
        if (!isProcessingAll && queue.length > 0) {
          runBatchProcessing();
        }
        return;
      }

      // Space: Trigger Quick View on selected item
      if (e.key === ' ' && !quickViewItem && !inspectItem) {
        if (selectedIds.size > 0) {
          e.preventDefault();
          const firstSelected = queue.find((i) => selectedIds.has(i.id));
          if (firstSelected) {
            setQuickViewItem(firstSelected);
          }
        }
        return;
      }

      // Escape: Deselect all or close modals
      if (e.key === 'Escape') {
        if (quickViewItem) {
          setQuickViewItem(null);
        } else if (inspectItem) {
          setInspectItem(null);
        } else if (selectedIds.size > 0) {
          e.preventDefault();
          deselectAll();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [queue, selectedIds, isProcessingAll, quickViewItem, inspectItem, completedCount]);

  const batchFaqs = [
    {
      id: 'batch-privacy',
      question: 'Are my batch images uploaded to an external server?',
      answer: 'No. Every single image in your batch is processed entirely in your browser using HTML5 Canvas, WebAssembly, and local CPU threads. Zero data leaves your computer.',
    },
    {
      id: 'batch-limit',
      question: 'Is there a limit on how many images I can process at once?',
      answer: 'PixelCraft supports batches of up to 50 images simultaneously. Our queue executor uses a 4-worker concurrency lock to ensure your browser remains fast and responsive.',
    },
    {
      id: 'batch-zip',
      question: 'How does the 1-click ZIP export work?',
      answer: 'Once processing completes, PixelCraft packs all Blobs into a standard ZIP binary structure directly inside browser memory (RAM) and triggers an instant download without network latency.',
    },
  ];

  return (
    <div
      onDragEnter={handleWorkspaceDragEnter}
      onDragOver={handleWorkspaceDragOver}
      onDragLeave={handleWorkspaceDragLeave}
      onDrop={handleWorkspaceDrop}
      className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 min-h-[80vh]"
    >
      {/* Full Workspace Interactive Drag & Drop Overlay */}
      {isDragActive && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-indigo-950/85 backdrop-blur-md text-white border-4 border-dashed border-indigo-400 m-4 sm:m-8 rounded-3xl transition-all animate-in fade-in duration-150 pointer-events-none">
          <div className="w-20 h-20 rounded-2xl bg-indigo-600/90 text-white flex items-center justify-center shadow-2xl mb-4 animate-bounce">
            <Upload className="w-10 h-10" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-center">
            Drop Images Anywhere to Add to Queue
          </h3>
          <p className="mt-2 text-sm text-indigo-200 font-medium text-center max-w-md">
            Release your files to add them directly to your active Batch Studio processing queue.
          </p>
        </div>
      )}

      {/* Breadcrumbs */}
      <Breadcrumbs />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-xs">
            <Layers className="w-6 h-6" />
          </div>

          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span>Multi-File Suite</span>
              <span aria-hidden="true">·</span>
              <span className="text-indigo-600 dark:text-indigo-400">Batch Mode</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Batch Processing Studio
            </h1>

            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
              Upload, edit, resize, convert, and compress dozens of images at once. 100% in-browser privacy with 1-click ZIP export.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:items-end text-xs text-slate-500 dark:text-slate-400">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="font-sans font-medium text-[11px]">100% In-Memory Batch</span>
          </div>
          <span className="mt-1.5 text-[11px]">
            Max 50 Files · Parallel Queue
          </span>
        </div>
      </div>

      {/* Alerts */}
      {notification && (
        <SuccessNotification
          title="Batch Action Complete"
          message={notification}
          onDismiss={() => setNotification(null)}
        />
      )}

      {errorMessage && (
        <ErrorMessage
          message={errorMessage}
          onDismiss={() => setErrorMessage(null)}
          onRetry={runBatchProcessing}
        />
      )}

      {/* Main Batch Workspace */}
      <div className="space-y-6">
        {queue.length === 0 ? (
          <FileUpload
            multiple={true}
            onBatchSelect={handleBatchSelect}
            title="Drop multiple images to start batch processing"
            subtitle="Supports JPG, PNG, WEBP, AVIF, SVG (Up to 50MB per file) · Process dozens in one click"
          />
        ) : (
          <div className="space-y-6">
            {/* Top Batch Navigation Bar & Actions */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mr-2">
                  Select Tool Mode:
                </span>
                {[
                  { id: 'convert', label: 'Converter', icon: RefreshCw },
                  { id: 'compress', label: 'Compressor', icon: Minimize2 },
                  { id: 'resize', label: 'Resizer', icon: Maximize2 },
                  { id: 'crop', label: 'Cropper', icon: Crop },
                ].map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setActiveTool(t.id as BatchToolId)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        activeTool === t.id
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Add files button */}
                <label className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer transition-colors">
                  <Plus className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Add More Files</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files) handleBatchSelect(Array.from(e.target.files));
                    }}
                    className="hidden"
                  />
                </label>

                {/* View switcher */}
                <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-800 p-0.5 bg-slate-50 dark:bg-slate-950">
                  <button
                    type="button"
                    onClick={() => setViewLayout('grid')}
                    className={`p-1.5 rounded-md ${viewLayout === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}
                    title="Grid view"
                  >
                    <Grid className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewLayout('list')}
                    className={`p-1.5 rounded-md ${viewLayout === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}
                    title="List view"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={clearQueue}
                  className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors"
                >
                  Clear Queue
                </button>
              </div>
            </div>

            {queue.length > 0 && <ExifInfoPanel file={queue[0]} className="mb-4" />}

            {/* Quick Action Preset Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border border-indigo-200/80 dark:border-indigo-900/60 bg-indigo-50/60 dark:bg-indigo-950/40 text-xs shadow-xs">
              <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Quick Preset Actions:</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => applyQuickPreset('instagram-square')}
                  className="px-3 py-1.5 rounded-xl font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-indigo-500 hover:text-indigo-600 shadow-2xs transition-all cursor-pointer"
                >
                  📷 Instagram Square (1:1)
                </button>

                <button
                  type="button"
                  onClick={() => applyQuickPreset('youtube-thumbnail')}
                  className="px-3 py-1.5 rounded-xl font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-indigo-500 hover:text-indigo-600 shadow-2xs transition-all cursor-pointer"
                >
                  🎬 Thumbnail Format (720p)
                </button>

                <button
                  type="button"
                  onClick={() => applyQuickPreset('web-compressed')}
                  className="px-3 py-1.5 rounded-xl font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-indigo-500 hover:text-indigo-600 shadow-2xs transition-all cursor-pointer"
                >
                  ⚡ Web Compressed (80%)
                </button>

                <button
                  type="button"
                  onClick={() => applyQuickPreset('grayscale')}
                  className={`px-3 py-1.5 rounded-xl font-bold border shadow-2xs transition-all cursor-pointer ${
                    colorFilter === 'grayscale'
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-indigo-500'
                  }`}
                >
                  🏁 Grayscale Filter
                </button>

                <button
                  type="button"
                  onClick={() => applyQuickPreset('avif-ultra')}
                  className="px-3 py-1.5 rounded-xl font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-indigo-500 hover:text-indigo-600 shadow-2xs transition-all cursor-pointer"
                >
                  🚀 AVIF Ultra
                </button>
              </div>
            </div>

            {/* UNIFIED GLOBAL PARAMETERS PANEL */}
            <div className="p-5 rounded-2xl border border-indigo-200/90 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/30 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-indigo-100 dark:border-indigo-900/50">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Global Batch Parameters ({activeTool.toUpperCase()})
                  </h3>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  Applied to all {queue.length} images simultaneously
                </span>
              </div>

              {/* 1. CONVERT / COMPRESS PARAMETERS */}
              {(activeTool === 'convert' || activeTool === 'compress') && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Output Format
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {(['WEBP', 'PNG', 'JPG', 'AVIF'] as const).map((fmt) => (
                        <button
                          key={fmt}
                          type="button"
                          onClick={() => setTargetFormat(fmt)}
                          className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                            targetFormat === fmt
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          {fmt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        Compression Quality
                      </span>
                      <span className="font-mono tabular-nums text-indigo-600 font-bold">{quality}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={quality}
                      onChange={(e) => setQuality(Number(e.target.value))}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* 2. RESIZE PARAMETERS */}
              {activeTool === 'resize' && (
                <div className="space-y-4 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Scaling Mode:</span>
                    <button
                      type="button"
                      onClick={() => setResizeMode('scale')}
                      className={`px-3 py-1 rounded-lg font-bold ${
                        resizeMode === 'scale' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-900 border'
                      }`}
                    >
                      Percentage Scale
                    </button>
                    <button
                      type="button"
                      onClick={() => setResizeMode('dimensions')}
                      className={`px-3 py-1 rounded-lg font-bold ${
                        resizeMode === 'dimensions' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-900 border'
                      }`}
                    >
                      Max Dimension Bounds
                    </button>
                  </div>

                  {resizeMode === 'scale' ? (
                    <div>
                      <span className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Scale Ratio:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {[25, 50, 75, 150, 200].map((pct) => (
                          <button
                            key={pct}
                            type="button"
                            onClick={() => setScalePercent(pct)}
                            className={`px-3 py-1.5 rounded-lg font-bold ${
                              scalePercent === pct ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-900 border'
                            }`}
                          >
                            {pct}% Scale
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-500 mb-1">Max Width (px)</label>
                        <input
                          type="number"
                          min="1"
                          value={targetWidth}
                          onChange={(e) => setTargetWidth(Number(e.target.value))}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-500 mb-1">Max Height (px)</label>
                        <input
                          type="number"
                          min="1"
                          value={targetHeight}
                          onChange={(e) => setTargetHeight(Number(e.target.value))}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono text-xs font-bold"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 3. CROP PARAMETERS */}
              {activeTool === 'crop' && (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Batch Aspect Ratio Preset
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {(['1:1', '16:9', '4:3', '9:16', '2:3'] as const).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setCropRatio(r)}
                          className={`px-3 py-1.5 rounded-lg font-bold ${
                            cropRatio === r ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-900 border'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* BATCH EXECUTION BUTTON */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-indigo-100 dark:border-indigo-900/50">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {queue.length} items in queue · 4 parallel worker threads
                </span>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={runBatchProcessing}
                    disabled={isProcessingAll}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 shadow-sm transition-all cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>{isProcessingAll ? `Processing (${overallProgress}%)...` : `Process All ${queue.length} Images`}</span>
                  </button>

                  {completedCount > 0 && (
                    <button
                      type="button"
                      onClick={handleDownloadZip}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 shadow-sm transition-all cursor-pointer shrink-0"
                    >
                      <Archive className="w-4 h-4" />
                      <span>Download ZIP ({completedCount})</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* REAL-TIME VISUAL BATCH PROGRESS INDICATOR */}
            {(isProcessingAll || queue.some((i) => i.status !== 'idle')) && (
              <BatchProgressIndicator
                queue={queue}
                isProcessing={isProcessingAll}
                overallProgress={overallProgress}
                activeToolName={activeTool}
                onCancel={() => setIsProcessingAll(false)}
              />
            )}

            {/* KEYBOARD SHORTCUTS HINT BAR */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 text-xs">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold">
                <Keyboard className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Shortcuts:</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                <span className="inline-flex items-center gap-1 font-mono">
                  <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-sans font-semibold text-[10px] text-slate-700 dark:text-slate-200 shadow-2xs">Ctrl+A</kbd> Select All
                </span>
                <span className="text-slate-300 dark:text-slate-700">·</span>
                <span className="inline-flex items-center gap-1 font-mono">
                  <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-sans font-semibold text-[10px] text-slate-700 dark:text-slate-200 shadow-2xs">Del</kbd> Remove Selected
                </span>
                <span className="text-slate-300 dark:text-slate-700">·</span>
                <span className="inline-flex items-center gap-1 font-mono">
                  <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-sans font-semibold text-[10px] text-slate-700 dark:text-slate-200 shadow-2xs">Ctrl+S</kbd> Download ZIP
                </span>
                <span className="text-slate-300 dark:text-slate-700">·</span>
                <span className="inline-flex items-center gap-1 font-mono">
                  <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-sans font-semibold text-[10px] text-slate-700 dark:text-slate-200 shadow-2xs">Space</kbd> Quick View
                </span>
                <span className="text-slate-300 dark:text-slate-700">·</span>
                <span className="inline-flex items-center gap-1 font-mono">
                  <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-sans font-semibold text-[10px] text-slate-700 dark:text-slate-200 shadow-2xs">Ctrl+↵</kbd> Run Batch
                </span>
                <span className="text-slate-300 dark:text-slate-700">·</span>
                <span className="inline-flex items-center gap-1 font-mono">
                  <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-sans font-semibold text-[10px] text-slate-700 dark:text-slate-200 shadow-2xs">Esc</kbd> Deselect
                </span>
              </div>
            </div>

            {/* SELECTION ACTION BAR (Visible when items selected) */}
            {selectedIds.size > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/80 dark:bg-indigo-950/40 text-xs shadow-xs animate-in fade-in duration-150">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                    <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    {selectedIds.size} of {queue.length} selected
                  </span>
                  <div className="h-4 w-px bg-indigo-200 dark:bg-indigo-900" />
                  <button
                    type="button"
                    onClick={selectAll}
                    className="font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                  >
                    Select All (Ctrl+A)
                  </button>
                  <button
                    type="button"
                    onClick={deselectAll}
                    className="font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                  >
                    Deselect (Esc)
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const first = queue.find((i) => selectedIds.has(i.id));
                      if (first) setQuickViewItem(first);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:text-indigo-600 text-xs font-semibold shadow-2xs cursor-pointer"
                    title="Inspect selected image in Quick View (Space)"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Quick View</span>
                  </button>
                  <button
                    type="button"
                    onClick={removeSelectedItems}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                    title="Remove selected items (Delete)"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete ({selectedIds.size})</span>
                  </button>
                </div>
              </div>
            )}

            {/* QUEUE GRID / LIST VIEW */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Batch Queue ({queue.length} Items)
                </span>
                {totalSavedBytes > 0 && (
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    Total Saved: {formatBytes(totalSavedBytes)}
                  </span>
                )}
              </div>

              {viewLayout === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {queue.map((item) => {
                    const isSelected = selectedIds.has(item.id);
                    return (
                      <div
                        key={item.id}
                        className={`group relative flex flex-col rounded-2xl border p-3 bg-white dark:bg-slate-900 transition-all ${
                          isSelected
                            ? 'border-indigo-500 ring-2 ring-indigo-500 shadow-md bg-indigo-50/10'
                            : item.status === 'completed'
                            ? 'border-emerald-500/80 dark:border-emerald-500/80 shadow-xs'
                            : item.status === 'error'
                            ? 'border-rose-400 dark:border-rose-900/80'
                            : item.status === 'processing'
                            ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        {/* Thumbnail frame */}
                        <div
                          onClick={() => setQuickViewItem(item)}
                          className="relative w-full h-36 rounded-xl bg-slate-100 dark:bg-slate-950 overflow-hidden flex items-center justify-center border border-slate-200/60 dark:border-slate-800 mb-3 cursor-pointer group/thumb bg-[linear-gradient(45deg,#cbd5e1_25%,transparent_25%),linear-gradient(-45deg,#cbd5e1_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#cbd5e1_75%),linear-gradient(-45deg,transparent_75%,#cbd5e1_75%)] dark:bg-[linear-gradient(45deg,#1e293b_25%,transparent_25%),linear-gradient(-45deg,#1e293b_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#1e293b_75%),linear-gradient(-45deg,transparent_75%,#1e293b_75%)] [background-size:16px_16px] [background-position:0_0,0_8px,8px_-8px,-8px_0px]"
                        >
                          <img
                            src={item.processedResult?.url || item.originalUrl}
                            alt={item.name}
                            className="max-h-full max-w-full object-contain transition-transform duration-200 group-hover/thumb:scale-105"
                          />

                          {/* Selection Checkbox */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSelectItem(item.id);
                            }}
                            className={`absolute top-2 left-2 z-10 w-6 h-6 rounded-md flex items-center justify-center transition-all ${
                              isSelected
                                ? 'bg-indigo-600 text-white shadow-xs'
                                : 'bg-slate-900/60 hover:bg-slate-900 text-white opacity-80 group-hover:opacity-100'
                            }`}
                            title={isSelected ? 'Deselect item' : 'Select item'}
                          >
                            {isSelected ? (
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            ) : (
                              <Square className="w-3.5 h-3.5 text-white/80" />
                            )}
                          </button>

                          {/* Quick View Fullscreen Zoom Trigger */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setQuickViewItem(item);
                            }}
                            className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-slate-900/85 hover:bg-slate-900 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-md cursor-pointer"
                            title="Quick View Fullscreen Zoom"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Status Overlay Badge */}
                          <div className="absolute top-2 right-2">
                            {item.status === 'completed' && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-600 text-white shadow-xs">
                                Done
                              </span>
                            )}
                            {item.status === 'processing' && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-600 text-white animate-pulse">
                                Processing
                              </span>
                            )}
                            {item.status === 'error' && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-600 text-white">
                                Error
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Info & Metadata */}
                        <div className="flex-1 space-y-1">
                          <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate" title={item.name}>
                            {item.name}
                          </div>

                          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 tabular-nums">
                            <span>{item.width} × {item.height}px</span>
                            <span>{formatBytes(item.sizeBytes)}</span>
                          </div>

                          {item.processedResult && (
                            <div className="flex items-center justify-between text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold tabular-nums">
                              <span>New: {formatBytes(item.processedResult.sizeBytes)}</span>
                              <span>{item.processedResult.format}</span>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1.5">
                          {item.processedResult ? (
                            <button
                              type="button"
                              onClick={() => handleSingleDownload(item)}
                              className="flex-1 inline-flex items-center justify-center gap-1 py-1 px-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 text-[11px] font-bold transition-colors cursor-pointer"
                            >
                              <Download className="w-3 h-3" />
                              <span>Download</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setInspectItem(item)}
                              className="flex-1 inline-flex items-center justify-center gap-1 py-1 px-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-[11px] font-medium transition-colors cursor-pointer"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Inspect</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setQuickViewItem(item)}
                            className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Quick View Fullscreen Zoom"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                            title="Remove from batch"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* LIST VIEW */
                <div className="space-y-2">
                  {queue.map((item) => {
                    const isSelected = selectedIds.has(item.id);
                    return (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between gap-4 p-3 rounded-xl border bg-white dark:bg-slate-900 text-xs transition-all ${
                          isSelected
                            ? 'border-indigo-500 ring-2 ring-indigo-500 shadow-xs bg-indigo-50/15'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {/* Selection Checkbox */}
                          <button
                            type="button"
                            onClick={() => toggleSelectItem(item.id)}
                            className={`w-5 h-5 rounded flex items-center justify-center shrink-0 transition-all ${
                              isSelected
                                ? 'bg-indigo-600 text-white'
                                : 'border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-500'
                            }`}
                            title={isSelected ? 'Deselect item' : 'Select item'}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </button>

                          {/* Thumbnail with Quick View on click */}
                          <button
                            type="button"
                            onClick={() => setQuickViewItem(item)}
                            className="relative group/thumb cursor-pointer shrink-0"
                            title="Click for Quick View"
                          >
                            <img
                              src={item.processedResult?.url || item.originalUrl}
                              alt={item.name}
                              className="w-10 h-10 rounded-lg object-contain bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
                            />
                            <span className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center text-white transition-opacity">
                              <Maximize2 className="w-3.5 h-3.5" />
                            </span>
                          </button>

                          <div>
                            <div className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-xs">
                              {item.name}
                            </div>
                            <div className="text-[11px] font-mono text-slate-500 tabular-nums">
                              {item.width} × {item.height}px · {formatBytes(item.sizeBytes)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {item.processedResult && (
                            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold tabular-nums">
                              {formatBytes(item.processedResult.sizeBytes)} ({item.processedResult.format})
                            </span>
                          )}

                          {item.status === 'completed' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white">
                              Completed
                            </span>
                          )}

                          {item.processedResult ? (
                            <button
                              type="button"
                              onClick={() => handleSingleDownload(item)}
                              className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold hover:bg-emerald-100 cursor-pointer"
                              title="Download processed file"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setInspectItem(item)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                              title="Inspect comparison"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setQuickViewItem(item)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                            title="Quick View Fullscreen Zoom"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                            title="Remove from batch"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* INSPECTION MODAL */}
      {inspectItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                Inspection Preview: {inspectItem.name}
              </h3>
              <button
                type="button"
                onClick={() => setInspectItem(null)}
                className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                Close ✕
              </button>
            </div>

            <ImagePreview
              originalUrl={inspectItem.originalUrl}
              processedUrl={inspectItem.processedResult?.url}
              originalSizeBytes={inspectItem.sizeBytes}
              processedSizeBytes={inspectItem.processedResult?.sizeBytes}
              width={inspectItem.processedResult ? inspectItem.processedResult.width : inspectItem.width}
              height={inspectItem.processedResult ? inspectItem.processedResult.height : inspectItem.height}
              format={inspectItem.processedResult ? inspectItem.processedResult.format : 'ORIGINAL'}
              title={`Batch ${activeTool.toUpperCase()} Preview`}
            />
          </div>
        </div>
      )}

      {/* QUICK VIEW FULLSCREEN ZOOM MODAL */}
      {quickViewItem && (
        <QuickViewModal
          isOpen={!!quickViewItem}
          onClose={() => setQuickViewItem(null)}
          imageUrl={quickViewItem.processedResult?.url || quickViewItem.originalUrl}
          imageName={quickViewItem.name}
          width={quickViewItem.processedResult ? quickViewItem.processedResult.width : quickViewItem.width}
          height={quickViewItem.processedResult ? quickViewItem.processedResult.height : quickViewItem.height}
          sizeBytes={quickViewItem.processedResult ? quickViewItem.processedResult.sizeBytes : quickViewItem.sizeBytes}
          format={quickViewItem.processedResult ? quickViewItem.processedResult.format : 'ORIGINAL'}
          onDownload={() => handleSingleDownload(quickViewItem)}
        />
      )}

      {/* FAQs */}
      <section className="pt-8 border-t border-slate-200 dark:border-slate-800">
        <FaqAccordion
          items={batchFaqs}
          title="Batch Processing Studio FAQs"
          subtitle="Learn how PixelCraft handles multi-file processing securely in browser memory"
        />
      </section>

      {/* Related Tools */}
      <RelatedToolsSection currentToolId="bulk-resize" category="resize" />
    </div>
  );
}
