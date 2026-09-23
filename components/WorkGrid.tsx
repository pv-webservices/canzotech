'use client';

import { useState } from 'react';
import { solutionCategories, type Solution } from '@/lib/solutions';
import { CaseCard } from './CaseCard';

const ALL = 'All';

export function WorkGrid({ solutions }: { solutions: Solution[] }) {
  const [filter, setFilter] = useState<string>(ALL);
  const visible = filter === ALL ? solutions : solutions.filter((solution) => solution.categories.includes(filter as never));

  return (
    <>
      <div className="filter-row" role="tablist" aria-label="Filter projects by category">
        {[ALL, ...solutionCategories].map((category) => (
          <button
            key={category}
            type="button"
            role="tab"
            aria-selected={filter === category}
            className={`filter mono ${filter === category ? 'is-active' : ''}`}
            onClick={() => setFilter(category)}
          >
            {category}
            <span className="filter-count">{category === ALL ? solutions.length : solutions.filter((s) => s.categories.includes(category as never)).length}</span>
          </button>
        ))}
      </div>

      <div className="case-grid">
        {visible.map((solution, index) => (
          <div key={solution.slug} data-reveal="up" style={{ '--reveal-delay': `${index * 60}ms` } as React.CSSProperties}>
            <CaseCard solution={solution} priority={index < 2} />
          </div>
        ))}
      </div>
    </>
  );
}
