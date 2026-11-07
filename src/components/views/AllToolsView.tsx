import React, { useState, useMemo } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { TOOLS_DATA, TOOL_CATEGORIES } from '../../data/toolsData';
import { ToolCard } from '../common/ToolCard';
import { Breadcrumbs } from '../common/Breadcrumbs';

export const AllToolsView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredTools = useMemo(() => {
    return TOOLS_DATA.filter((tool) => {
      const matchesCategory =
        selectedCategory === 'all' || tool.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.supportedInputFormats.some((fmt) =>
          fmt.toLowerCase().includes(searchQuery.toLowerCase())
        );

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      {/* Breadcrumbs */}
      <Breadcrumbs />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Complete Tool Suite</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            All Free Image Utilities
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Professional browser-native tools with zero cloud uploads or usage caps.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <label htmlFor="search-tools-input" className="sr-only">
            Search tools by name, format, or task
          </label>
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="search-tools-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tools or formats (e.g. WebP)..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors shadow-xs"
          />
        </div>
      </div>

      {/* NativeBanner_1 4:1 */}
<script async="async" data-cfasync="false" src="https://crypotential.com/6de8cb71d409fab9ac244d9e54d15fb0/invoke.js"></script>
<div id="container-6de8cb71d409fab9ac244d9e54d15fb0"></div>

      {/* Category Segmented Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {TOOL_CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          const count =
            cat.id === 'all'
              ? TOOLS_DATA.length
              : TOOLS_DATA.filter((t) => t.category === cat.id).length;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded-md ${
                  isActive
                    ? 'bg-indigo-700/60 text-indigo-100'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tools Count */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
        <span>
          Showing <span className="tabular-nums font-semibold text-slate-900 dark:text-white">{filteredTools.length}</span> of <span className="tabular-nums">{TOOLS_DATA.length}</span> utilities
        </span>
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Clear Search
          </button>
        )}
      </div>

      {/* Grid */}
      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            No image tools match "{searchQuery}"
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Try searching for "PNG", "Compress", or reset your category filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="mt-4 px-4 py-2 text-xs font-semibold rounded-lg text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
