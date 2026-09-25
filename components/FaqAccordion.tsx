'use client';

import { useId, useState } from 'react';

/**
 * Every answer is rendered into the HTML (closed ones are `hidden`), so search engines and the
 * FAQPage structured data see the same content a visitor can open.
 */
export function FaqAccordion({ items }: { items: { question: string; answer: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const baseId = useId();

  return (
    <div className="faq-list">
      {items.map((item, index) => {
        const isOpen = open === index;
        const answerId = `${baseId}-answer-${index}`;
        return (
          <div className={`faq-item ${isOpen ? 'open' : ''}`} key={item.question}>
            <h3 className="faq-question">
              <button type="button" onClick={() => setOpen(isOpen ? null : index)} aria-expanded={isOpen} aria-controls={answerId}>
                <span>{item.question}</span>
                <span className="faq-symbol" aria-hidden="true">{isOpen ? '–' : '+'}</span>
              </button>
            </h3>
            <div className="faq-answer" id={answerId} hidden={!isOpen}>
              <p>{item.answer}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
