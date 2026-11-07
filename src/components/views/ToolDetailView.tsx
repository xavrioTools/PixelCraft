import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Crop,
  Minimize2,
  Maximize2,
  Wand2,
  Zap,
  Layers,
  FileCode2,
  Lock,
  Unlock,
  Sliders,
  RotateCcw,
  Palette,
  Upload,
  Image as ImageIcon,
  Paintbrush,
  Pipette,
  Check,
  Eye,
} from 'lucide-react';
import { useRouter } from '../../context/RouterContext';
import { TOOLS_DATA } from '../../data/toolsData';
import { ToolDefinition, FAQItem } from '../../types/tools';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { FileUpload } from '../common/FileUpload';
import { ImagePreview } from '../common/ImagePreview';
import { QuickViewModal } from '../common/QuickViewModal';
import { QuickTip } from '../common/QuickTip';
import { ProcessingLoader } from '../common/ProcessingLoader';
import { DownloadComponent } from '../common/DownloadComponent';
import { SuccessNotification } from '../common/SuccessNotification';
import { ErrorMessage } from '../common/ErrorMessage';
import { FaqAccordion } from '../common/FaqAccordion';
import { RelatedToolsSection } from '../common/RelatedToolsSection';
import { useSharedImage } from '../../context/SharedImageContext';
import { formatBytes } from '../../utils/formatters';
import { ExifInfoPanel } from '../common/ExifInfoPanel';
import {
  executeCrop,
  executeResize,
  executeBackgroundRemoval,
  compositeCutoutOverBackground,
  executeCompressionOrConversion,
  ProcessedImageResult,
  ClarityPreset,
  CustomBackgroundConfig,
  CustomBackgroundType,
} from '../../utils/imageProcessors';

const iconMap: Record<string, React.ElementType> = {
  RefreshCw,
  Minimize2,
  Crop,
  Maximize2,
  Wand2,
  Zap,
  Layers,
  FileCode2,
};

interface ToolDetailViewProps {
  toolId?: string;
}

export const ToolDetailView: React.FC<ToolDetailViewProps> = ({ toolId }) => {
  const { currentPath, navigate } = useRouter();

  const tool: ToolDefinition =
    TOOLS_DATA.find((t) => (toolId ? t.id === toolId : t.path === currentPath)) ||
    TOOLS_DATA[0];

  const IconComponent = iconMap[tool.iconName] || Sparkles;

  // Tool workspace active state
  const [selectedFile, setSelectedFile] = useState<{
    url: string;
    file: File;
    name: string;
    size: number;
    width: number;
    height: number;
  } | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stepLabel, setStepLabel] = useState('');
  const [processedResult, setProcessedResult] = useState<ProcessedImageResult | null>(null);
  const [cachedCutoutCanvas, setCachedCutoutCanvas] = useState<HTMLCanvasElement | null>(null);
  const [isRecompositing, setIsRecompositing] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  // 1. CROPPING & RESIZING CONTROLS STATE
  const [cropRatio, setCropRatio] = useState<'free' | '1:1' | '16:9' | '4:3' | '9:16' | '2:3'>('free');
  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);
  const [cropWidth, setCropWidth] = useState(0);
  const [cropHeight, setCropHeight] = useState(0);
  const [clarityPreset, setClarityPreset] = useState<ClarityPreset>('crisp');
  const [colorFilter, setColorFilter] = useState<'none' | 'grayscale' | 'sepia'>('none');

  const applyQuickPreset = (preset: 'instagram-square' | 'youtube-thumbnail' | 'web-compressed' | 'grayscale' | 'avif-ultra') => {
    if (preset === 'instagram-square') {
      setCropResizeMode('crop');
      handleCropRatioChange('1:1');
      setColorFilter('none');
      setNotification("Applied 'Instagram Square (1:1)' preset.");
    } else if (preset === 'youtube-thumbnail') {
      setCropResizeMode('resize');
      setTargetWidth(1280);
      setTargetHeight(720);
      setColorFilter('none');
      setNotification("Applied 'YouTube Thumbnail (1280x720)' preset.");
    } else if (preset === 'web-compressed') {
      setColorFilter('none');
      setNotification("Applied 'Web Compressed' preset.");
    } else if (preset === 'grayscale') {
      setColorFilter('grayscale');
      setNotification("Applied 'Grayscale' filter preset.");
    } else if (preset === 'avif-ultra') {
      setColorFilter('none');
      setNotification("Applied 'AVIF Ultra' preset.");
    }
  };

  // 2. RESIZING CONTROLS STATE
  const [targetWidth, setTargetWidth] = useState(0);
  const [targetHeight, setTargetHeight] = useState(0);
  const [lockAspectRatio, setLockAspectRatio] = useState(true);
  const [cropResizeMode, setCropResizeMode] = useState<'crop' | 'resize'>('resize');

  // 3. BACKGROUND REMOVAL & CUSTOM BACKDROP STATE
  const [bgMode, setBgMode] = useState<'auto' | 'custom-color' | 'white-backdrop' | 'green-screen' | 'black-backdrop'>('auto');
  const [bgScope, setBgScope] = useState<'perimeter' | 'global'>('perimeter');
  const [bgTargetHex, setBgTargetHex] = useState('#FFFFFF');
  const [bgSensitivity, setBgSensitivity] = useState(35);
  const [bgFeather, setBgFeather] = useState(2);
  const [bgInvert, setBgInvert] = useState(false);

  // User Custom Background Configuration
  const [bgReplacerTab, setBgReplacerTab] = useState<CustomBackgroundType>('transparent');
  const [customBgColor, setCustomBgColor] = useState('#FFFFFF');
  const [customBgGradient, setCustomBgGradient] = useState('indigo-glow');
  const [customBgImageUrl, setCustomBgImageUrl] = useState<string | null>(null);
  const [customBgImageName, setCustomBgImageName] = useState<string | null>(null);
  const [bgBlur, setBgBlur] = useState(0);


  const { sharedImage } = useSharedImage();

  // Initialize crop and resize parameters whenever an image is loaded
  const initializeToolControls = (width: number, height: number) => {
    setCropResizeMode(tool.id === 'crop' ? 'crop' : 'resize');
    // Crop defaults to full image or 90% center
    setCropX(Math.round(width * 0.05));
    setCropY(Math.round(height * 0.05));
    setCropWidth(Math.round(width * 0.9));
    setCropHeight(Math.round(height * 0.9));

    // Resize defaults to image original dimensions
    setTargetWidth(width);
    setTargetHeight(height);
  };

  // Set Crop aspect ratio preset
  const handleCropRatioChange = (ratio: 'free' | '1:1' | '16:9' | '4:3' | '9:16' | '2:3') => {
    setCropRatio(ratio);
    if (!selectedFile) return;

    const imgW = selectedFile.width;
    const imgH = selectedFile.height;

    let targetRatio = 1;
    if (ratio === '1:1') targetRatio = 1;
    else if (ratio === '16:9') targetRatio = 16 / 9;
    else if (ratio === '4:3') targetRatio = 4 / 3;
    else if (ratio === '9:16') targetRatio = 9 / 16;
    else if (ratio === '2:3') targetRatio = 2 / 3;
    else {
      // Freeform
      setCropX(0);
      setCropY(0);
      setCropWidth(imgW);
      setCropHeight(imgH);
      return;
    }

    let w = imgW * 0.85;
    let h = w / targetRatio;

    if (h > imgH * 0.85) {
      h = imgH * 0.85;
      w = h * targetRatio;
    }

    w = Math.round(w);
    h = Math.round(h);
    const x = Math.max(0, Math.round((imgW - w) / 2));
    const y = Math.max(0, Math.round((imgH - h) / 2));

    setCropX(x);
    setCropY(y);
    setCropWidth(w);
    setCropHeight(h);
  };

  // Resize dimension sync
  const handleWidthChange = (val: number) => {
    const w = Math.max(1, Math.round(val));
    setTargetWidth(w);
    if (lockAspectRatio && selectedFile && selectedFile.width > 0) {
      const ratio = selectedFile.height / selectedFile.width;
      setTargetHeight(Math.max(1, Math.round(w * ratio)));
    }
  };

  const handleHeightChange = (val: number) => {
    const h = Math.max(1, Math.round(val));
    setTargetHeight(h);
    if (lockAspectRatio && selectedFile && selectedFile.height > 0) {
      const ratio = selectedFile.width / selectedFile.height;
      setTargetWidth(Math.max(1, Math.round(h * ratio)));
    }
  };

  const applyScalePercentage = (pct: number) => {
    if (!selectedFile) return;
    const factor = pct / 100;
    setTargetWidth(Math.max(1, Math.round(selectedFile.width * factor)));
    setTargetHeight(Math.max(1, Math.round(selectedFile.height * factor)));
  };

  // Initialize from shared image if arriving from Quick Upload
  useEffect(() => {
    if (sharedImage) {
      setSelectedFile({
        url: sharedImage.url,
        file: sharedImage.file,
        name: sharedImage.name,
        size: sharedImage.sizeBytes,
        width: sharedImage.width,
        height: sharedImage.height,
      });
      setProcessedResult(null);
      setIsProcessing(false);
      setProgress(0);
      initializeToolControls(sharedImage.width, sharedImage.height);
      setNotification(`Loaded "${sharedImage.name}". Configure settings below and click "Process with ${tool.name}".`);
    } else {
      setSelectedFile(null);
      setProcessedResult(null);
      setIsProcessing(false);
      setProgress(0);
      setNotification(null);
      setErrorMessage(null);
    }
  }, [currentPath, sharedImage]);

  const handleFileSelect = (file: File) => {
    setErrorMessage(null);
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.src = url;
    img.onload = async () => {
      setSelectedFile({
        url,
        file,
        name: file.name,
        size: file.size,
        width: img.width,
        height: img.height,
      });
      setProcessedResult(null);
      setIsProcessing(false);
      setProgress(0);
      initializeToolControls(img.width, img.height);
      setNotification(`Image loaded: ${file.name} (${img.width}×${img.height}px). Ready for ${tool.name}.`);


    };

    img.onerror = () => {
      setErrorMessage('Could not decode image pixels. Please try another image file.');
    };
  };

  // Real-time instant re-compositing whenever user changes background settings
  const recompositeLive = async (updatedConfig: CustomBackgroundConfig) => {
    if (!cachedCutoutCanvas) return;
    setIsRecompositing(true);
    try {
      const updated = await compositeCutoutOverBackground(
        cachedCutoutCanvas,
        updatedConfig,
        'image/png',
        0.96
      );
      setProcessedResult(updated);
    } catch (e) {
      console.error('Recomposite failed:', e);
    } finally {
      setIsRecompositing(false);
    }
  };

  const handleBgReplacerTabChange = (tab: CustomBackgroundType) => {
    setBgReplacerTab(tab);
    if (cachedCutoutCanvas) {
      recompositeLive({
        type: tab,
        color: customBgColor,
        gradient: customBgGradient,
        imageUrl: customBgImageUrl || undefined,
        backgroundBlur: bgBlur,
      });
    }
  };

  const handleCustomBgColorChange = (hex: string) => {
    setCustomBgColor(hex);
    if (cachedCutoutCanvas) {
      recompositeLive({
        type: 'color',
        color: hex,
        gradient: customBgGradient,
        imageUrl: customBgImageUrl || undefined,
        backgroundBlur: bgBlur,
      });
    }
  };

  const handleCustomBgGradientChange = (gradId: string) => {
    setCustomBgGradient(gradId);
    if (cachedCutoutCanvas) {
      recompositeLive({
        type: 'gradient',
        color: customBgColor,
        gradient: gradId,
        imageUrl: customBgImageUrl || undefined,
        backgroundBlur: bgBlur,
      });
    }
  };

  const handleCustomBgImageChange = (url: string, name: string) => {
    setCustomBgImageUrl(url);
    setCustomBgImageName(name);
    if (cachedCutoutCanvas) {
      recompositeLive({
        type: 'image',
        color: customBgColor,
        gradient: customBgGradient,
        imageUrl: url,
        backgroundBlur: bgBlur,
      });
    }
  };

  const handleBgBlurChange = (blur: number) => {
    setBgBlur(blur);
    if (cachedCutoutCanvas && bgReplacerTab === 'image') {
      recompositeLive({
        type: 'image',
        color: customBgColor,
        gradient: customBgGradient,
        imageUrl: customBgImageUrl || undefined,
        backgroundBlur: blur,
      });
    }
  };

  const sampleImagePoint = (pointName: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right') => {
    if (!selectedFile) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = selectedFile.url;
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = img.width;
      c.height = img.height;
      const ctx = c.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      let sx = 4, sy = 4;
      if (pointName === 'top-right') { sx = img.width - 5; sy = 4; }
      else if (pointName === 'bottom-left') { sx = 4; sy = img.height - 5; }
      else if (pointName === 'bottom-right') { sx = img.width - 5; sy = img.height - 5; }
      const p = ctx.getImageData(sx, sy, 1, 1).data;
      const hex = '#' + ((1 << 24) + (p[0] << 16) + (p[1] << 8) + p[2]).toString(16).slice(1).toUpperCase();
      setBgTargetHex(hex);
      setNotification(`Sampled ${pointName} pixel color: ${hex}`);
    };
  };

  const openNativeEyeDropper = async () => {
    if (typeof window !== 'undefined' && 'EyeDropper' in window) {
      try {
        const eyeDropper = new (window as any).EyeDropper();
        const pickResult = await eyeDropper.open();
        if (pickResult?.sRGBHex) {
          setBgTargetHex(pickResult.sRGBHex);
          setNotification(`Sampled color ${pickResult.sRGBHex} from screen.`);
        }
      } catch {
        // User cancelled
      }
    }
  };

  // REAL CANVAS PROCESSING EXECUTION
  const runToolProcessing = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setProgress(20);
    setStepLabel(`Reading image pixels into memory for ${tool.name}...`);
    setErrorMessage(null);

    try {
      let result: ProcessedImageResult;

      const isCropping = tool.id === 'crop' || (tool.id === 'resize' && cropResizeMode === 'crop');
      if (isCropping) {
        setProgress(50);
        setStepLabel('Extracting cropped sub-rectangle with anti-blur clarity...');
        result = await executeCrop(
          selectedFile.url,
          {
            x: cropX,
            y: cropY,
            width: cropWidth,
            height: cropHeight,
          },
          'image/png',
          0.96,
          clarityPreset,
          colorFilter
        );
      } else if (tool.id === 'resize') {
        setProgress(50);
        setStepLabel(`Resampling to ${targetWidth} × ${targetHeight}px with stepped downscaling...`);
        result = await executeResize(
          selectedFile.url,
          targetWidth,
          targetHeight,
          'image/png',
          0.96,
          clarityPreset,
          colorFilter
        );
      } else if (tool.id === 'background-remover') {
        setProgress(40);
        setStepLabel(
          bgReplacerTab === 'transparent'
            ? 'Removing backdrop and generating transparent alpha cutout...'
            : `Removing backdrop and compositing custom ${bgReplacerTab} background...`
        );
        const bgResult = await executeBackgroundRemoval(selectedFile.url, {
          sensitivity: bgSensitivity,
          edgeFeather: bgFeather,
          mode: bgMode,
          scope: bgScope,
          targetColorHex: bgTargetHex,
          invertMask: bgInvert,
          customBackground: {
            type: bgReplacerTab,
            color: customBgColor,
            gradient: customBgGradient,
            imageUrl: customBgImageUrl || undefined,
            backgroundBlur: bgBlur,
          },
        });
        setCachedCutoutCanvas(bgResult.cutoutCanvas);
        result = bgResult;
      } else if (tool.id === 'compress') {
        setProgress(50);
        setStepLabel('Quantizing high frequencies and Huffman encoding to WebP...');
        result = await executeCompressionOrConversion(selectedFile.url, 'image/webp', 0.75, colorFilter);

      } else {
        // Converter / WebP / SVG
        setProgress(50);
        setStepLabel(`Transcoding format to ${tool.supportedOutputFormats[0]}...`);
        const mime = tool.supportedOutputFormats[0] === 'PNG' ? 'image/png' : 'image/webp';
        result = await executeCompressionOrConversion(selectedFile.url, mime, 0.9, colorFilter);
      }

      setProgress(100);
      setIsProcessing(false);
      setProcessedResult(result);
      setNotification(`Successfully executed ${tool.name}! New size: ${formatBytes(result.sizeBytes)}.`);
    } catch (err: unknown) {
      setIsProcessing(false);
      setProgress(0);
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(`Failed to process image: ${msg}`);
    }
  };

  const handleDownload = (options: { format: string; quality: number; filename: string }) => {
    if (!processedResult) return;
    const link = document.createElement('a');
    link.href = processedResult.url;
    link.download = options.filename;
    link.click();
    setNotification(`Downloaded ${options.filename}`);
  };

  // Specific FAQs for this tool
  const toolFaqs: FAQItem[] = [
    {
      id: `${tool.id}-how-it-works`,
      question: `How does the ${tool.name} work without sending files to a server?`,
      answer: `PixelCraft leverages modern WebAssembly (Wasm) and HTML5 Canvas APIs built directly into your browser engine. The image data is loaded into your computer's RAM, processed via multi-threaded web workers, and rendered locally. No network transfers occur.`,
    },
    {
      id: `${tool.id}-formats`,
      question: `What formats can I export with ${tool.name}?`,
      answer: `You can export to ${tool.supportedOutputFormats.join(', ')}. Each format supports custom quality adjustments to balance sharpness and file size.`,
    },
    {
      id: `${tool.id}-quality`,
      question: 'Will there be any noticeable loss in image quality?',
      answer: 'Our optimization engine uses perceptual loss algorithms that remove redundant color data invisible to the human eye while preserving crisp text, high-contrast edges, and fine gradients.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      {/* Breadcrumbs */}
      <Breadcrumbs />

      {/* Tool Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-xs">
            <IconComponent className="w-6 h-6" />
          </div>

          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span>{tool.categoryLabel}</span>
              {tool.badge && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-indigo-600 dark:text-indigo-400">{tool.badge}</span>
                </>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {tool.name}
            </h1>

            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
              {tool.tagline}. {tool.description}
            </p>
          </div>
        </div>

        {/* Formats badge tag & Batch Mode Shortcut */}
        <div className="flex flex-col sm:items-end gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="font-sans font-medium text-[11px]">100% Client-Side</span>
          </div>
          <button
            type="button"
            onClick={() => navigate('/batch')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 font-sans font-bold text-xs transition-colors cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Switch to Batch Mode</span>
          </button>
        </div>
      </div>

      {/* Notifications and Alerts */}
      {notification && (
        <SuccessNotification
          title="Operation Ready"
          message={notification}
          onDismiss={() => setNotification(null)}
        />
      )}

      {errorMessage && (
        <ErrorMessage
          message={errorMessage}
          onDismiss={() => setErrorMessage(null)}
          onRetry={runToolProcessing}
        />
      )}

      {/* Interactive Tool Workspace */}
      <div className="space-y-6">
        {!selectedFile ? (
          <FileUpload
            onFileSelect={handleFileSelect}
            title={`Drop your image to start ${tool.name.toLowerCase()}`}
            subtitle={`Supports ${tool.supportedInputFormats.join(', ')} up to 50MB · No sign-up required`}
          />
        ) : (
          <div className="space-y-6">
            {/* Top Workspace Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-2xs">
                  <IconComponent className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
                    {selectedFile.name}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 tabular-nums">
                    <span>{selectedFile.width} × {selectedFile.height}px</span>
                    <span>·</span>
                    <span>{formatBytes(selectedFile.size)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsQuickViewOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                  title="Quick View Fullscreen Zoom"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Quick View</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setProcessedResult(null);
                    setCachedCutoutCanvas(null);
                    setNotification(null);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-600 dark:text-slate-400 text-xs font-semibold hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Change Image</span>
                </button>
              </div>
            </div>

            {/* PROCESSING PROGRESS */}
            {isProcessing && (
              <ProcessingLoader
                progressPercent={progress}
                stepLabel={stepLabel}
                title={`Executing ${tool.name}`}
                onCancel={() => {
                  setIsProcessing(false);
                  setProgress(0);
                }}
              />
            )}

            {/* TWO-COLUMN STUDIO WORKSPACE */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* LEFT COLUMN: INSPECTOR & CONTROLS (lg:col-span-5) */}
              <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-20">
                {selectedFile && !isProcessing && (
                  <div className="p-5 rounded-2xl border border-indigo-200/90 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/30 shadow-sm space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-100 dark:border-indigo-900/50">
                      <div className="flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          {tool.name} Parameters
                        </h3>
                      </div>

                      <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                        Input: {selectedFile.width} × {selectedFile.height} px ({formatBytes(selectedFile.size)})
                      </span>
                    </div>

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
                      onClick={() => applyQuickPreset('grayscale')}
                      className={`px-3 py-1.5 rounded-xl font-bold border shadow-2xs transition-all cursor-pointer ${
                        colorFilter === 'grayscale'
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-indigo-500'
                      }`}
                    >
                      🏁 Grayscale Filter
                    </button>
                  </div>
                </div>

                {/* Crop & Resize Mode Switcher */}
                {tool.id === 'resize' && (
                  <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-200/60 dark:bg-slate-900 border border-slate-300/80 dark:border-slate-800 w-fit">
                    <button
                      type="button"
                      onClick={() => setCropResizeMode('resize')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        cropResizeMode === 'resize'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Scale & Resize
                    </button>
                    <button
                      type="button"
                      onClick={() => setCropResizeMode('crop')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        cropResizeMode === 'crop'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Crop Bounds
                    </button>
                  </div>
                )}

                {/* 1. CROPPING CONTROLS */}
                {(tool.id === 'crop' || (tool.id === 'resize' && cropResizeMode === 'crop')) && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Aspect Ratio Presets
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {(['free', '1:1', '16:9', '4:3', '9:16', '2:3'] as const).map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => handleCropRatioChange(r)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              cropRatio === r
                                ? 'bg-indigo-600 text-white shadow-xs'
                                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                            }`}
                          >
                            {r === 'free' ? 'Freeform' : r}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <label className="block text-[11px] text-slate-500 mb-1">X Offset (px)</label>
                        <input
                          type="number"
                          min="0"
                          max={selectedFile.width - 1}
                          value={cropX}
                          onChange={(e) => setCropX(Math.max(0, Number(e.target.value)))}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-500 mb-1">Y Offset (px)</label>
                        <input
                          type="number"
                          min="0"
                          max={selectedFile.height - 1}
                          value={cropY}
                          onChange={(e) => setCropY(Math.max(0, Number(e.target.value)))}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-500 mb-1">Crop Width (px)</label>
                        <input
                          type="number"
                          min="1"
                          max={selectedFile.width}
                          value={cropWidth}
                          onChange={(e) => setCropWidth(Math.max(1, Number(e.target.value)))}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-500 mb-1">Crop Height (px)</label>
                        <input
                          type="number"
                          min="1"
                          max={selectedFile.height}
                          value={cropHeight}
                          onChange={(e) => setCropHeight(Math.max(1, Number(e.target.value)))}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono text-xs"
                        />
                      </div>
                    </div>

                    {/* Anti-Blur Clarity Control for Crop */}
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Image Sharpness & Clarity (Anti-Blur)
                        </span>
                        <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 capitalize">
                          {clarityPreset === 'crisp' ? 'Crisp (Anti-blur applied)' : clarityPreset === 'sharp' ? 'Ultra-sharp' : 'Original smoothing'}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'crisp', label: 'Crisp (Recommended)', desc: 'Prevents blur' },
                          { id: 'sharp', label: 'Ultra-Sharp', desc: 'Maximum edge detail' },
                          { id: 'original', label: 'Original', desc: 'Standard smooth' },
                        ].map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setClarityPreset(c.id as ClarityPreset)}
                            className={`p-2 rounded-xl text-left border transition-all ${
                              clarityPreset === c.id
                                ? 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-600 text-indigo-700 dark:text-indigo-300 font-bold shadow-xs'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                            }`}
                          >
                            <div className="text-xs font-semibold">{c.label}</div>
                            <div className="text-[10px] text-slate-400">{c.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. RESIZING CONTROLS */}
                {tool.id === 'resize' && cropResizeMode === 'resize' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Target Width (px)
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={targetWidth}
                          onChange={(e) => handleWidthChange(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono text-xs font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Target Height (px)
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={targetHeight}
                          onChange={(e) => handleHeightChange(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono text-xs font-bold"
                        />
                      </div>

                      <div>
                        <button
                          type="button"
                          onClick={() => setLockAspectRatio(!lockAspectRatio)}
                          className={`w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                            lockAspectRatio
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                          }`}
                        >
                          {lockAspectRatio ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                          <span>{lockAspectRatio ? 'Aspect Locked' : 'Free Dimensions'}</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Quick Scaling Presets
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {[25, 50, 75, 150, 200].map((pct) => (
                          <button
                            key={pct}
                            type="button"
                            onClick={() => applyScalePercentage(pct)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                          >
                            {pct}% Scale
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            setTargetWidth(selectedFile.width);
                            setTargetHeight(selectedFile.height);
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900"
                        >
                          Reset Original
                        </button>
                      </div>
                    </div>

                    {/* Anti-Blur Clarity Control for Resize */}
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Resampling Engine & Clarity (Anti-Blur)
                        </span>
                        <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 capitalize">
                          {clarityPreset === 'crisp' ? 'Stepped Mipmap + Crisp' : clarityPreset === 'sharp' ? 'Ultra-sharp' : 'Original smoothing'}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'crisp', label: 'Crisp (Anti-blur)', desc: 'Multi-step downscaling' },
                          { id: 'sharp', label: 'Ultra-Sharp', desc: 'Maximum contrast edges' },
                          { id: 'original', label: 'Original', desc: 'Single-pass smooth' },
                        ].map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setClarityPreset(c.id as ClarityPreset)}
                            className={`p-2 rounded-xl text-left border transition-all ${
                              clarityPreset === c.id
                                ? 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-600 text-indigo-700 dark:text-indigo-300 font-bold shadow-xs'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                            }`}
                          >
                            <div className="text-xs font-semibold">{c.label}</div>
                            <div className="text-[10px] text-slate-400">{c.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. BACKGROUND REMOVAL & CUSTOM BACKGROUND REPLACER */}
                {tool.id === 'background-remover' && (
                  <div className="space-y-6">
                    {/* SECTION A: DETECT & ERASE BACKDROP */}
                    <div className="p-4 rounded-xl bg-white/70 dark:bg-slate-900/80 border border-indigo-100 dark:border-indigo-950 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                          <Wand2 className="w-3.5 h-3.5" />
                          Step 1: Background Detection & Keying
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-500">Scope:</span>
                          <QuickTip tip="Connected Borders: Flood fills starting from edge pixels. Global: Removes all matching color instances regardless of location." />
                          <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-800 p-0.5 bg-slate-100 dark:bg-slate-950">
                            <button
                              type="button"
                              onClick={() => setBgScope('perimeter')}
                              className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                                bgScope === 'perimeter'
                                  ? 'bg-indigo-600 text-white shadow-xs'
                                  : 'text-slate-600 dark:text-slate-400'
                              }`}
                              title="Flood fill starting from edges; preserves internal matching colors"
                            >
                              Connected Borders
                            </button>
                            <button
                              type="button"
                              onClick={() => setBgScope('global')}
                              className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                                bgScope === 'global'
                                  ? 'bg-indigo-600 text-white shadow-xs'
                                  : 'text-slate-600 dark:text-slate-400'
                              }`}
                              title="Removes color everywhere across the image (including gaps between arms/legs)"
                            >
                              Everywhere
                            </button>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          Backdrop Mode
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                          {[
                            { id: 'auto', label: 'Auto Border' },
                            { id: 'custom-color', label: 'Pick Color' },
                            { id: 'white-backdrop', label: 'Studio White' },
                            { id: 'green-screen', label: 'Green Screen' },
                            { id: 'black-backdrop', label: 'Studio Black' },
                          ].map((m) => (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => setBgMode(m.id as any)}
                              className={`px-2.5 py-2 rounded-xl text-xs font-bold transition-all text-center ${
                                bgMode === m.id
                                  ? 'bg-indigo-600 text-white shadow-xs'
                                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                              }`}
                            >
                              {m.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Custom Color Selector (if mode === 'custom-color') */}
                      {bgMode === 'custom-color' && (
                        <div className="space-y-3 p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900">
                          <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                Target Backdrop Color:
                              </span>
                              <input
                                type="color"
                                value={bgTargetHex}
                                onChange={(e) => setBgTargetHex(e.target.value)}
                                className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0.5"
                              />
                              <input
                                type="text"
                                value={bgTargetHex}
                                onChange={(e) => setBgTargetHex(e.target.value)}
                                className="w-24 px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono text-xs uppercase"
                              />
                            </div>

                            <div className="flex items-center gap-1.5 ml-auto">
                              <span className="text-[11px] text-slate-400">Presets:</span>
                              {['#FFFFFF', '#F3F4F6', '#00FF00', '#0000FF', '#000000'].map((c) => (
                                <button
                                  key={c}
                                  type="button"
                                  onClick={() => setBgTargetHex(c)}
                                  style={{ backgroundColor: c }}
                                  className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-700 shadow-xs"
                                  title={`Set to ${c}`}
                                />
                              ))}
                            </div>
                          </div>

                          {/* Interactive Eyedropper & Point Sampling */}
                          <div className="pt-2 border-t border-indigo-100 dark:border-indigo-900/60 flex flex-wrap items-center gap-2 text-xs">
                            <span className="text-[11px] font-semibold text-slate-500">Sample from image:</span>
                            <button
                              type="button"
                              onClick={() => sampleImagePoint('top-left')}
                              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-[11px] font-medium text-slate-700 dark:text-slate-300 transition-colors"
                            >
                              Top-Left Corner
                            </button>
                            <button
                              type="button"
                              onClick={() => sampleImagePoint('top-right')}
                              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-[11px] font-medium text-slate-700 dark:text-slate-300 transition-colors"
                            >
                              Top-Right Corner
                            </button>
                            <button
                              type="button"
                              onClick={() => sampleImagePoint('bottom-left')}
                              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-[11px] font-medium text-slate-700 dark:text-slate-300 transition-colors"
                            >
                              Bottom-Left Corner
                            </button>
                            {typeof window !== 'undefined' && 'EyeDropper' in window && (
                              <button
                                type="button"
                                onClick={openNativeEyeDropper}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold shadow-xs transition-colors"
                              >
                                <Pipette className="w-3 h-3" />
                                <span>Eyedropper</span>
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Sliders */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-1">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              Sensitivity / Tolerance
                            </span>
                            <span className="font-mono tabular-nums text-indigo-600 font-bold">{bgSensitivity}%</span>
                          </div>
                          <input
                            type="range"
                            min="5"
                            max="95"
                            value={bgSensitivity}
                            onChange={(e) => setBgSensitivity(Number(e.target.value))}
                            className="w-full accent-indigo-600 cursor-pointer"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              Edge Feather / Smoothing
                            </span>
                            <span className="font-mono tabular-nums text-indigo-600 font-bold">{bgFeather}px</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="6"
                            value={bgFeather}
                            onChange={(e) => setBgFeather(Number(e.target.value))}
                            className="w-full accent-indigo-600 cursor-pointer"
                          />
                        </div>

                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() => setBgInvert(!bgInvert)}
                            className={`w-full py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                              bgInvert
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {bgInvert ? '✓ Inverted (Mask Swapped)' : 'Invert Cutout Mask'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* SECTION B: SET MY OWN BACKGROUND (User Feature Request) */}
                    <div className="p-4 rounded-xl bg-white/70 dark:bg-slate-900/80 border border-indigo-100 dark:border-indigo-950 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                          <Palette className="w-3.5 h-3.5" />
                          Step 2: Set Your Own Background
                        </span>

                        {cachedCutoutCanvas ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>Cutout Active · Updates LIVE below</span>
                            {isRecompositing && <span className="animate-spin text-indigo-600">⌛</span>}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500 font-medium">
                            Choose backdrop below · Click &quot;Remove Background Now&quot; to apply
                          </span>
                        )}
                      </div>

                      {/* Replacer Mode Tabs */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { id: 'transparent', label: 'Transparent (PNG)' },
                          { id: 'color', label: 'Custom Solid Color' },
                          { id: 'gradient', label: 'Studio Gradient' },
                          { id: 'image', label: 'Custom Photo / Scene' },
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => handleBgReplacerTabChange(tab.id as CustomBackgroundType)}
                            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                              bgReplacerTab === tab.id
                                ? 'bg-indigo-600 text-white shadow-xs'
                                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>

                      {/* 1. SOLID COLOR REPLACER */}
                      {bgReplacerTab === 'color' && (
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                              Custom Hex Color:
                            </span>
                            <input
                              type="color"
                              value={customBgColor}
                              onChange={(e) => handleCustomBgColorChange(e.target.value)}
                              className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0.5"
                            />
                            <input
                              type="text"
                              value={customBgColor}
                              onChange={(e) => handleCustomBgColorChange(e.target.value)}
                              className="w-24 px-2 py-1 rounded border border-slate-300 dark:border-slate-700 font-mono text-xs uppercase"
                            />
                            <div
                              className="w-8 h-8 rounded-lg border border-slate-300 shadow-xs"
                              style={{ backgroundColor: customBgColor }}
                            />
                            {cachedCutoutCanvas && (
                              <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold ml-auto">
                                Live color preview active
                              </span>
                            )}
                          </div>

                          <div>
                            <span className="block text-[11px] font-semibold text-slate-500 mb-1.5">
                              Studio Palette Presets:
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {[
                                { hex: '#FFFFFF', name: 'Pure White' },
                                { hex: '#F8FAFC', name: 'Studio Off-White' },
                                { hex: '#0F172A', name: 'Dark Slate' },
                                { hex: '#4F46E5', name: 'PixelCraft Indigo' },
                                { hex: '#EC4899', name: 'Vibrant Pink' },
                                { hex: '#10B981', name: 'Emerald' },
                                { hex: '#F59E0B', name: 'Warm Amber' },
                                { hex: '#E0E7FF', name: 'Soft Lavender' },
                                { hex: '#64748B', name: 'Studio Gray' },
                              ].map((p) => (
                                <button
                                  key={p.hex}
                                  type="button"
                                  onClick={() => handleCustomBgColorChange(p.hex)}
                                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs transition-all ${
                                    customBgColor.toLowerCase() === p.hex.toLowerCase()
                                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 font-bold text-indigo-700 dark:text-indigo-300'
                                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                                  }`}
                                >
                                  <span
                                    className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0"
                                    style={{ backgroundColor: p.hex }}
                                  />
                                  <span>{p.name}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 2. STUDIO GRADIENT REPLACER */}
                      {bgReplacerTab === 'gradient' && (
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                              Select Studio Gradient:
                            </span>
                            {cachedCutoutCanvas && (
                              <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
                                Live gradient preview active
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {[
                              { id: 'sunset', name: 'Sunset Horizon', style: 'linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)' },
                              { id: 'indigo-glow', name: 'Indigo Glow', style: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' },
                              { id: 'modern-studio', name: 'Modern Studio', style: 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)' },
                              { id: 'cyber-neon', name: 'Cyber Neon', style: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)' },
                              { id: 'warm-peach', name: 'Warm Peach', style: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
                              { id: 'mint-fresh', name: 'Mint Fresh', style: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)' },
                              { id: 'rose-gold', name: 'Rose Gold', style: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)' },
                            ].map((g) => (
                              <button
                                key={g.id}
                                type="button"
                                onClick={() => handleCustomBgGradientChange(g.id)}
                                className={`p-2.5 rounded-xl border text-left transition-all ${
                                  customBgGradient === g.id
                                    ? 'border-indigo-600 ring-2 ring-indigo-500/30'
                                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-400'
                                }`}
                              >
                                <div className="w-full h-8 rounded-lg mb-1.5 shadow-inner" style={{ background: g.style }} />
                                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">{g.name}</div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 3. CUSTOM IMAGE REPLACER */}
                      {bgReplacerTab === 'image' && (
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
                          <div>
                            <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                              Upload Your Own Background Photo:
                            </span>
                            <div className="flex flex-col sm:flex-row items-center gap-3">
                              <label className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 cursor-pointer shadow-xs">
                                <Upload className="w-4 h-4 text-indigo-600" />
                                <span>Browse Image File</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const url = URL.createObjectURL(file);
                                      handleCustomBgImageChange(url, file.name);
                                    }
                                  }}
                                  className="hidden"
                                />
                              </label>

                              {customBgImageName && (
                                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                  ✓ Loaded: {customBgImageName}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Curated Studio Scene Presets */}
                          <div>
                            <span className="block text-[11px] font-semibold text-slate-500 mb-2">
                              Or Choose a Studio Scene:
                            </span>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              {[
                                {
                                  name: 'Minimalist Studio',
                                  url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="%23f1f5f9"/><stop offset="1" stop-color="%23cbd5e1"/></linearGradient></defs><rect width="1200" height="800" fill="url(%23g1)"/><rect y="560" width="1200" height="240" fill="%2394a3b8"/><circle cx="200" cy="200" r="160" fill="%23ffffff" opacity="0.5"/></svg>',
                                },
                                {
                                  name: 'Luxury Bokeh',
                                  url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><defs><linearGradient id="lux" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="%231e1b4b"/><stop offset="1" stop-color="%234338ca"/></linearGradient></defs><rect width="1200" height="800" fill="url(%23lux)"/><circle cx="300" cy="250" r="140" fill="%23f43f5e" opacity="0.3"/><circle cx="850" cy="400" r="200" fill="%2338bdf8" opacity="0.25"/></svg>',
                                },
                                {
                                  name: 'Modern Office',
                                  url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><defs><linearGradient id="off" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="%23f8fafc"/><stop offset="1" stop-color="%2394a3b8"/></linearGradient></defs><rect width="1200" height="800" fill="url(%23off)"/><rect x="100" y="80" width="400" height="500" fill="%23ffffff" opacity="0.6" rx="8"/><rect y="600" width="1200" height="200" fill="%2364748b" opacity="0.3"/></svg>',
                                },
                                {
                                  name: 'Warm Cafe Bokeh',
                                  url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><defs><linearGradient id="cafe" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="%23451a03"/><stop offset="1" stop-color="%239a3412"/></linearGradient></defs><rect width="1200" height="800" fill="url(%23cafe)"/><circle cx="200" cy="180" r="100" fill="%23fde68a" opacity="0.35"/><circle cx="500" cy="300" r="140" fill="%23fed7aa" opacity="0.25"/></svg>',
                                },
                              ].map((scene) => (
                                <button
                                  key={scene.name}
                                  type="button"
                                  onClick={() => handleCustomBgImageChange(scene.url, scene.name)}
                                  className={`p-2 rounded-xl border text-left transition-all ${
                                    customBgImageUrl === scene.url
                                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 font-bold'
                                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                                  }`}
                                >
                                  <div className="w-full h-12 rounded-lg bg-cover bg-center mb-1 border border-slate-200 dark:border-slate-800" style={{ backgroundImage: `url("${scene.url}")` }} />
                                  <div className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 truncate">{scene.name}</div>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Bokeh Depth-of-Field Blur Slider */}
                          <div>
                            <div className="flex justify-between mb-1 text-xs">
                              <span className="font-semibold text-slate-700 dark:text-slate-300">
                                Portrait Depth-of-Field Blur:
                              </span>
                              <QuickTip tip="Applies a Gaussian blur to the replaced background to simulate lens depth-of-field, separating subject from background." />
                              <span className="font-mono tabular-nums text-indigo-600 font-bold">{bgBlur}px</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="20"
                              value={bgBlur}
                              onChange={(e) => handleBgBlurChange(Number(e.target.value))}
                              className="w-full accent-indigo-600 cursor-pointer"
                            />
                            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                              <span>Sharp (0px)</span>
                              <span>Subtle (6px)</span>
                              <span>Soft Bokeh (12px)</span>
                              <span>Heavy Blur (20px)</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}



                {/* PRIMARY EXECUTION TRIGGER BUTTON */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    All operations execute in-memory on your local CPU.
                  </span>

                  <button
                    type="button"
                    onClick={runToolProcessing}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-sm transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>
                      {processedResult
                        ? `Re-apply ${tool.id === 'resize' && cropResizeMode === 'crop' ? 'Crop' : tool.name}`
                        : tool.id === 'background-remover'
                        ? 'Remove Background Now'
                        : tool.id === 'crop' || (tool.id === 'resize' && cropResizeMode === 'crop')
                        ? 'Crop Image Now'
                        : tool.id === 'resize'
                        ? 'Resize Dimensions Now'
                        : `Execute ${tool.name}`}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: REALTIME CANVAS, OUTCOME & EXIF (lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-6">
            {/* REAL INTERACTIVE IMAGE PREVIEW */}
            <ImagePreview
              originalUrl={selectedFile.url}
              processedUrl={processedResult?.url}
              originalSizeBytes={selectedFile.size}
              processedSizeBytes={processedResult?.sizeBytes}
              width={processedResult ? processedResult.width : selectedFile.width}
              height={processedResult ? processedResult.height : selectedFile.height}
              format={processedResult ? processedResult.format : 'ORIGINAL'}
              title={`${tool.name} Canvas Preview`}
              onQuickView={() => setIsQuickViewOpen(true)}
            />

            {/* DOWNLOAD COMPONENT WITH REAL PROCESSED IMAGE */}
            {processedResult && !isProcessing && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                <div className="md:col-span-2">
                  <DownloadComponent
                    onDownload={handleDownload}
                    outputSizeBytes={processedResult.sizeBytes}
                    originalSizeBytes={selectedFile.size}
                    availableFormats={tool.supportedOutputFormats}
                    defaultFormat={processedResult.format}
                    defaultFilename={`${selectedFile.name.replace(/\.[^/.]+$/, '')}-${tool.id}`}
                  />
                </div>

                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Execution Outcome
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>
                        Dimensions: <strong className="font-mono">{processedResult.width} × {processedResult.height}px</strong>
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>
                        Payload: <strong className="font-mono">{formatBytes(processedResult.sizeBytes)}</strong>
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Format: {processedResult.format}</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* TECHNICAL EXIF & METADATA INSPECTOR */}
            <ExifInfoPanel
              file={{
                name: selectedFile.name,
                size: selectedFile.size,
                sizeBytes: processedResult?.sizeBytes || selectedFile.size,
                width: processedResult ? processedResult.width : selectedFile.width,
                height: processedResult ? processedResult.height : selectedFile.height,
                url: processedResult?.url || selectedFile.url,
              }}
            />
          </div>
        </div>
      </div>
    )}
  </div>

      {/* QUICK VIEW FULLSCREEN ZOOM MODAL */}
      {selectedFile && isQuickViewOpen && (
        <QuickViewModal
          isOpen={isQuickViewOpen}
          onClose={() => setIsQuickViewOpen(false)}
          imageUrl={processedResult?.url || selectedFile.url}
          imageName={selectedFile.name}
          width={processedResult?.width || selectedFile.width}
          height={processedResult?.height || selectedFile.height}
          sizeBytes={processedResult?.sizeBytes || selectedFile.size}
          format={processedResult?.format || selectedFile.file.type.split('/')[1]?.toUpperCase() || 'ORIGINAL'}
          onDownload={
            processedResult
              ? () =>
                  handleDownload({
                    format: processedResult.format,
                    quality: 0.96,
                    filename: `${selectedFile.name.replace(/\.[^/.]+$/, '')}-${tool.id}.${processedResult.format.toLowerCase()}`,
                  })
              : undefined
          }
        />
      )}

      {/* Tool FAQs */}
      <section className="pt-8 border-t border-slate-200 dark:border-slate-800">
        <FaqAccordion
          items={toolFaqs}
          title={`${tool.name} – Common Questions`}
          subtitle={`Learn how ${tool.name} processes images securely inside your browser`}
        />
      </section>

      {/* Related Tools Section */}
      <RelatedToolsSection currentToolId={tool.id} category={tool.category} />
    </div>
  );
};
