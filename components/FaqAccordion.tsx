'use client';

import { useState } from 'react';

export function FaqAccordion({ items }: { items: { question: string; answer: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="faq-list">
      {items.map((item, index) => (
        <div className={`faq-item ${open === index ? 'open' : ''}`} key={item.question}>
          <button onClick={() => setOpen(open === index ? null : index)} aria-expanded={open === index}>
            <span>{item.question}</span><span className="faq-symbol">{open === index ? '–' : '+'}</span>
          </button>
          {open === index ? <div className="faq-answer"><p>{item.answer}</p></div> : null}
        </div>
      ))}
    </div>
  );
}
