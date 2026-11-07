import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { TOOLS_DATA } from '../../data/toolsData';
import { ToolCard } from './ToolCard';
import { useRouter } from '../../context/RouterContext';

interface RelatedToolsSectionProps {
  currentToolId?: string;
  category?: string;
  maxItems?: number;
  title?: string;
  subtitle?: string;
  className?: string;
}

export const RelatedToolsSection: React.FC<RelatedToolsSectionProps> = ({
  currentToolId,
  category,
  maxItems = 3,
  title = 'Related Image Tools',
  subtitle = 'Discover more fast, browser-based utilities for creators',
  className = '',
}) => {
  const { navigate } = useRouter();

  // Filter tools: exclude current tool, prioritize same category if provided
  const relatedTools = TOOLS_DATA.filter((tool) => tool.id !== currentToolId)
    .sort((a, b) => {
      if (category && a.category === category && b.category !== category) return -1;
      if (category && b.category === category && a.category !== category) return 1;
      return (b.popular ? 1 : 0) - (a.popular ? 1 : 0);
    })
    .slice(0, maxItems);

  if (relatedTools.length === 0) return null;

  return (
    <section className={`w-full py-12 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Recommended Utilities</span>
          </div>
          <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            {title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {subtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/tools')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors shrink-0"
        >
          <span>View All Tools</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {relatedTools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </section>
  );
};
