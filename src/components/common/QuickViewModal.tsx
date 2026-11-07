import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  Maximize2,
  Minimize2,
  Info,
  Move,
} from 'lucide-react';
import { formatBytes } from '../../utils/formatters';

interface QuickViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  imageName: string;
  width?: number;
  height?: number;
  sizeBytes?: number;
  format?: string;
  onDownload?: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  imageName,
  width,
  height,
  sizeBytes,
  format,
  onDownload,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setZoomLevel(1);
      setPan({ x: 0, y: 0 });
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        handleZoomIn();
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        handleZoomOut();
      } else if (e.key === '0') {
        e.preventDefault();
        handleResetZoom();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(4, +(prev + 0.25).toFixed(2)));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => {
      const next = Math.max(0.5, +(prev - 0.25).toFixed(2));
      if (next <= 1) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setPan({ x: 0, y: 0 });
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoomLevel((prev) => Math.min(4, +(prev + 0.15).toFixed(2)));
    } else {
      setZoomLevel((prev) => {
        const next = Math.max(0.5, +(prev - 0.15).toFixed(2));
        if (next <= 1) setPan({ x: 0, y: 0 });
        return next;
      });
    }
  };

  // Pan dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Quick View Image Inspector"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950/92 backdrop-blur-md p-3 sm:p-6 select-none animate-fadeIn"
      onClick={onClose}
    >
      {/* Top Floating Control Bar */}
      <div
        className="absolute top-4 inset-x-3 sm:inset-x-8 flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-slate-900/95 border border-slate-800 text-white shadow-2xl z-20 backdrop-blur-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 truncate min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/30">
            <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="truncate min-w-0">
            <h3 className="text-xs sm:text-sm font-bold truncate text-slate-100" title={imageName}>
              {imageName}
            </h3>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] font-mono text-slate-400">
              {width && height && <span>{width} × {height} px</span>}
              {sizeBytes && <span>· {formatBytes(sizeBytes)}</span>}
              {format && <span className="text-indigo-400 font-bold">· {format}</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700">
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
              title="Zoom out (-)"
            >
              <ZoomOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <span className="px-1.5 sm:px-2 font-mono text-xs text-indigo-400 font-bold tabular-nums min-w-[42px] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
              title="Zoom in (+)"
            >
              <ZoomIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
              title="Reset zoom (0)"
            >
              <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

          {/* Fullscreen toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="hidden md:flex p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {onDownload && (
            <button
              type="button"
              onClick={onDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
              title="Download Image"
            >
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden md:inline">Download</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-800/90 hover:bg-rose-600 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700 ml-1"
            title="Close Quick View (Esc)"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* Main Full-Screen Zoom & Pan Canvas Container */}
      <div
        className="relative w-full h-full flex items-center justify-center overflow-hidden p-4 sm:p-8 mt-16 sm:mt-20 mb-10 rounded-2xl sm:rounded-3xl border border-slate-800/80 bg-slate-900/60 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]"
        onClick={(e) => e.stopPropagation()}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
      >
        <div
          className="transition-transform duration-75 ease-out flex items-center justify-center max-w-full max-h-full"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomLevel})`,
            transformOrigin: 'center center',
          }}
        >
          <img
            src={imageUrl}
            alt={imageName}
            draggable={false}
            className="max-w-[85vw] max-h-[75vh] object-contain rounded-xl shadow-2xl border border-slate-700/60 pointer-events-none select-none bg-[linear-gradient(45deg,#1e293b_25%,transparent_25%),linear-gradient(-45deg,#1e293b_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#1e293b_75%),linear-gradient(-45deg,transparent_75%,#1e293b_75%)] [background-size:16px_16px]"
          />
        </div>
      </div>

      {/* Bottom Footer Info Tip */}
      <div className="absolute bottom-3 text-center text-[11px] text-slate-400 font-mono flex items-center gap-2 bg-slate-900/80 px-3 py-1 rounded-full border border-slate-800/80 shadow-sm backdrop-blur-xs">
        <span>Scroll to zoom</span>
        <span>·</span>
        {zoomLevel > 1 && (
          <>
            <span className="text-indigo-400 font-semibold flex items-center gap-1">
              <Move className="w-3 h-3 inline" /> Drag to pan
            </span>
            <span>·</span>
          </>
        )}
        <span>Esc to close</span>
        <span>·</span>
        <span>+/- to zoom</span>
      </div>
    </div>
  );
};
