import React from 'react';
import {
  RefreshCw,
  Minimize2,
  Crop,
  Wand2,
  Zap,
  Layers,
  FileCode2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { ToolDefinition } from '../../types/tools';
import { useRouter } from '../../context/RouterContext';

const iconMap: Record<string, React.ElementType> = {
  RefreshCw,
  Minimize2,
  Crop,
  Wand2,
  Zap,
  Layers,
  FileCode2,
};

interface ToolCardProps {
  tool: ToolDefinition;
  className?: string;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool, className = '' }) => {
  const { navigate } = useRouter();
  const IconComponent = iconMap[tool.iconName] || Sparkles;

  return (
    <div
      role="article"
      aria-label={`${tool.name} tool card`}
      className={`group relative flex flex-col justify-between p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 shadow-sm hover:shadow-md transition-all duration-200 ${className}`}
    >
      <div>
        {/* Top bar of card */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white dark:group-hover:bg-indigo-500 transition-all duration-200 shadow-sm">
            <IconComponent className="w-5 h-5" aria-hidden="true" />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 dark:text-slate-500 font-medium">
              {tool.categoryLabel}
            </span>
            {tool.badge && (
              <>
                <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">·</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                  {tool.badge}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Title and descriptions */}
        <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {tool.name}
        </h3>

        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {tool.description}
        </p>

        {/* Formats info */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
          <span className="font-sans text-[10px] uppercase font-semibold text-slate-400">Supports:</span>
          <span className="truncate">{tool.supportedInputFormats.slice(0, 4).join(', ')}</span>
          {tool.supportedInputFormats.length > 4 && (
            <span className="text-slate-400">+{tool.supportedInputFormats.length - 4}</span>
          )}
        </div>
      </div>

      {/* Action link */}
      <div className="mt-5 pt-3">
        <button
          type="button"
          onClick={() => navigate(tool.path)}
          className="w-full inline-flex items-center justify-between px-3.5 py-2 text-xs font-semibold rounded-lg text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 transition-colors group-hover:shadow-sm"
        >
          <span>Use Tool</span>
          <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};
