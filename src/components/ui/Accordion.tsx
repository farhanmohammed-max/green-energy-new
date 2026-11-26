import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AccordionItemData {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export function Accordion({ items }: { items: AccordionItemData[] }) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div
            key={item.id}
            className="rounded-2xl border border-forest-900/10 bg-white transition-colors"
          >
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${item.id}`}
                id={`faq-btn-${item.id}`}
                onClick={() => setOpenId(isOpen ? null : item.id)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left cursor-pointer"
              >
                <span className="text-sm sm:text-base font-semibold text-ink">{item.question}</span>
                <ChevronDown
                  className={cn(
                    'h-5 w-5 shrink-0 text-forest-800 transition-transform duration-200',
                    isOpen && 'rotate-180',
                  )}
                  aria-hidden="true"
                />
              </button>
            </h3>
            {isOpen && (
              <div
                id={`faq-panel-${item.id}`}
                role="region"
                aria-labelledby={`faq-btn-${item.id}`}
                className="border-t border-forest-900/5 px-5 pb-5 pt-3 text-sm leading-relaxed text-muted"
              >
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
