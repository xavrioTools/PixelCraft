import React, { useState, useRef, useEffect } from 'react';
import { Upload, Image as ImageIcon, Sparkles, AlertCircle, Clipboard } from 'lucide-react';
import { validateImageFile } from '../../utils/formatters';

interface FileUploadProps {
  onFileSelect?: (file: File) => void;
  onBatchSelect?: (files: File[]) => void;
  multiple?: boolean;
  accept?: string;
  maxSizeBytes?: number;
  title?: string;
  subtitle?: string;
  className?: string;
  disabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  onBatchSelect,
  multiple = false,
  accept = 'image/jpeg,image/png,image/webp,image/avif,image/svg+xml',
  maxSizeBytes = 50 * 1024 * 1024,
  title = 'Drop your image here or browse files',
  subtitle = 'Supports WebP, PNG, JPG, AVIF, SVG (Up to 50MB) · 100% In-Browser Privacy',
  className = '',
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    if (multiple && onBatchSelect) {
      const validFiles: File[] = [];
      const errors: string[] = [];

      Array.from(files).forEach((f) => {
        const validation = validateImageFile(f, { maxBytes: maxSizeBytes });
        if (validation.valid) {
          validFiles.push(f);
        } else {
          errors.push(`${f.name}: ${validation.error}`);
        }
      });

      if (validFiles.length > 0) {
        setUploadError(errors.length > 0 ? `Loaded ${validFiles.length} valid files. Skipped ${errors.length} invalid items.` : null);
        onBatchSelect(validFiles);
      } else if (errors.length > 0) {
        setUploadError(errors[0]);
      }
    } else if (onFileSelect) {
      const file = files[0];
      const validation = validateImageFile(file, { maxBytes: maxSizeBytes });

      if (!validation.valid) {
        setUploadError(validation.error || 'Invalid file.');
        return;
      }

      setUploadError(null);
      onFileSelect(file);
    }
  };

  // Clipboard Paste support (Ctrl+V / Cmd+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (disabled) return;
      if (e.clipboardData && e.clipboardData.files && e.clipboardData.files.length > 0) {
        const imageFiles = Array.from(e.clipboardData.files).filter((f) => f.type.startsWith('image/'));
        if (imageFiles.length > 0) {
          e.preventDefault();
          const dt = new DataTransfer();
          imageFiles.forEach((f) => dt.items.add(f));
          handleFiles(dt.files);
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [disabled, multiple, maxSizeBytes]);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    handleFiles(e.dataTransfer.files);
  };

  const loadDemoImage = () => {
    if (disabled) return;

    if (multiple && onBatchSelect) {
      // Generate a set of 4 distinct sample images for batch studio testing
      const samplesConfig = [
        { name: 'dslr-studio-camera.png', color1: '#f8fafc', color2: '#0f172a', label: 'DSLR Product Camera' },
        { name: 'sunset-landscape-shoot.png', color1: '#ff7e5f', color2: '#feb47b', label: 'Sunset Horizon Shoot' },
        { name: 'cyberpunk-neon-portrait.png', color1: '#0f172a', color2: '#4f46e5', label: 'Cyberpunk Neon Studio' },
        { name: 'emerald-brand-asset.png', color1: '#d1fae5', color2: '#059669', label: 'Emerald Brand Asset' },
      ];

      const createdFiles: File[] = [];

      samplesConfig.forEach((cfg, idx) => {
        const c = document.createElement('canvas');
        c.width = 1200;
        c.height = 800;
        const ctx = c.getContext('2d');
        if (ctx) {
          const g = ctx.createLinearGradient(0, 0, 1200, 800);
          g.addColorStop(0, cfg.color1);
          g.addColorStop(1, cfg.color2);
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, 1200, 800);

          ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
          ctx.beginPath();
          ctx.arc(600, 400, 220 + idx * 20, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 40px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`Batch Sample #${idx + 1}: ${cfg.label}`, 600, 390);
          ctx.font = '22px sans-serif';
          ctx.fillText('1200 × 800 px · PixelCraft Multi-Queue', 600, 440);

          c.toBlob((blob) => {
            if (blob) {
              const file = new File([blob], cfg.name, { type: 'image/png' });
              createdFiles.push(file);
              if (createdFiles.length === samplesConfig.length) {
                onBatchSelect(createdFiles);
              }
            }
          }, 'image/png');
        }
      });
      return;
    }

    // Single sample image generation
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const isBgRemover = title?.toLowerCase().includes('background') || (typeof window !== 'undefined' && window.location.pathname.includes('background'));

      if (isBgRemover) {
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, 1200, 800);

        const shadowGrad = ctx.createRadialGradient(600, 560, 20, 600, 560, 320);
        shadowGrad.addColorStop(0, 'rgba(15, 23, 42, 0.18)');
        shadowGrad.addColorStop(1, 'rgba(248, 250, 252, 0)');
        ctx.fillStyle = shadowGrad;
        ctx.beginPath();
        ctx.ellipse(600, 560, 300, 45, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.roundRect(380, 260, 440, 270, 32);
        ctx.fill();

        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.roundRect(390, 280, 70, 230, 16);
        ctx.fill();

        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.moveTo(530, 260);
        ctx.lineTo(560, 210);
        ctx.lineTo(640, 210);
        ctx.lineTo(670, 260);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.roundRect(420, 240, 40, 20, 4);
        ctx.fill();
        ctx.fillStyle = '#6366f1';
        ctx.beginPath();
        ctx.roundRect(730, 245, 45, 15, 4);
        ctx.fill();

        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(600, 400, 125, 0, Math.PI * 2);
        ctx.fill();

        ctx.lineWidth = 6;
        ctx.strokeStyle = '#4f46e5';
        ctx.stroke();

        const lensGrad = ctx.createRadialGradient(580, 380, 10, 600, 400, 110);
        lensGrad.addColorStop(0, '#38bdf8');
        lensGrad.addColorStop(0.4, '#1e1b4b');
        lensGrad.addColorStop(1, '#020617');
        ctx.fillStyle = lensGrad;
        ctx.beginPath();
        ctx.arc(600, 400, 110, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.beginPath();
        ctx.ellipse(565, 360, 35, 18, -Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(600, 400, 60, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(485, 310, 6, 0, Math.PI * 2);
        ctx.fill();
      } else {
        const grad = ctx.createLinearGradient(0, 0, 1200, 800);
        grad.addColorStop(0, '#4f46e5');
        grad.addColorStop(0.5, '#7c3aed');
        grad.addColorStop(1, '#9333ea');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1200, 800);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.beginPath();
        ctx.arc(600, 400, 260, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.roundRect(400, 260, 400, 280, 24);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 44px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('PixelCraft Demo Sample', 600, 390);

        ctx.font = '24px sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.fillText('1200 × 800px · 24-bit RGB Gradient', 600, 440);
      }

      canvas.toBlob((blob) => {
        if (blob) {
          const sampleFile = new File([blob], 'pixelcraft-sample.png', { type: 'image/png' });
          if (multiple && onBatchSelect) {
            onBatchSelect([sampleFile]);
          } else if (onFileSelect) {
            onFileSelect(sampleFile);
          }
        }
      }, 'image/png');
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        aria-label="Upload file area"
        className={`relative flex flex-col items-center justify-center p-8 sm:p-12 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center ${
          disabled
            ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-800'
            : isDragging
            ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 dark:border-indigo-500 scale-[0.99]'
            : 'border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-slate-50/60 dark:hover:bg-slate-900'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="sr-only"
          disabled={disabled}
          onChange={(e) => handleFiles(e.target.files)}
        />

        <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 shadow-sm">
          <Upload className="w-6 h-6" />
        </div>

        <h4 className="text-base font-semibold text-slate-900 dark:text-white">
          {title}
        </h4>

        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-md">
          {subtitle}
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors cursor-pointer">
            <ImageIcon className="w-4 h-4" />
            <span>{multiple ? 'Select Multiple Files from Device' : 'Select File from Device'}</span>
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              loadDemoImage();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>{multiple ? 'Try with Sample Batch Set (4 Images)' : 'Try with Sample Image'}</span>
          </button>
        </div>

        <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
          <Clipboard className="w-3 h-3 text-indigo-500" />
          <span>or press</span>
          <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[10px] font-semibold text-slate-600 dark:text-slate-300">
            Ctrl+V
          </kbd>
          <span>to paste from clipboard</span>
        </div>
      </div>

      {uploadError && (
        <div
          role="alert"
          className="mt-3 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center gap-2.5 text-xs text-rose-700 dark:text-rose-300"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
          <span>{uploadError}</span>
        </div>
      )}
    </div>
  );
};
