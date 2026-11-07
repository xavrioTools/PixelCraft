import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { FAQItem } from '../../types/tools';
import { GLOBAL_FAQS } from '../../data/faqData';

interface FaqAccordionProps {
  items?: FAQItem[];
  title?: string;
  subtitle?: string;
  className?: string;
}

export const FaqAccordion: React.FC<FaqAccordionProps> = ({
  items = GLOBAL_FAQS,
  title = 'Frequently Asked Questions',
  subtitle = 'Everything you need to know about PixelCraft image editing platform',
  className = '',
}) => {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id || null);

  const toggleItem = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      {(title || subtitle) && (
        <div className="text-center mb-8">
          {title && (
            <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          )}
        </div>
      )}

      <div className="divide-y divide-slate-200 dark:divide-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        {items.map((item) => {
          const isOpen = openId === item.id;
          return (
            <div key={item.id} className="transition-colors">
              <button
                type="button"
                onClick={() => toggleItem(item.id)}
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${item.id}`}
                className="w-full flex items-center justify-between gap-4 p-5 text-left focus:outline-none focus-visible:bg-slate-50 dark:focus-visible:bg-slate-800/50 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
              >
                <span className="flex items-center gap-2.5 text-sm font-semibold text-slate-900 dark:text-white">
                  <HelpCircle className="w-4 h-4 text-indigo-500 shrink-0" aria-hidden="true" />
                  <span>{item.question}</span>
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                    isOpen ? 'rotate-180 text-indigo-600 dark:text-indigo-400' : ''
                  }`}
                  aria-hidden="true"
                />
              </button>

              {isOpen && (
                <div
                  id={`faq-answer-${item.id}`}
                  role="region"
                  aria-labelledby={`faq-question-${item.id}`}
                  className="px-5 pb-5 pt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed pl-11 animate-fadeIn"
                >
                  <p>{item.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
