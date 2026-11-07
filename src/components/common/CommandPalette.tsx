import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, Layers, ArrowRight, Sparkles } from 'lucide-react';
import { TOOLS_DATA } from '../../data/toolsData';
import { useRouter } from '../../context/RouterContext';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const { navigate } = useRouter();
  const [search, setSearch] = useState('');

  const items = useMemo(() => {
    const pages = [
      { name: 'Home', path: '/', icon: Sparkles },
      { name: 'All Tools', path: '/tools', icon: Layers },
      { name: 'Batch Studio', path: '/batch', icon: Layers },
      { name: 'About Us', path: '/about', icon: Sparkles },
    ];
    
    const tools = TOOLS_DATA.map(t => ({ name: t.name, path: t.path, icon: Sparkles }));
    
    return [...pages, ...tools];
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter(item => 
      item.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [items, search]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else { /* Handled by parent toggle */ }
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            autoFocus
            placeholder="Search tools and pages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white outline-none placeholder:text-slate-400"
          />
          <button onClick={onClose} className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {filteredItems.length === 0 ? (
            <div className="p-4 text-center text-sm text-slate-500">No results found.</div>
          ) : (
            filteredItems.map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  onClose();
                }}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-left transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-200">{item.name}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-indigo-500" />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
