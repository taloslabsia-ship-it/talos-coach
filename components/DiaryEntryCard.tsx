'use client';

import { useState } from 'react';
import { formatDate } from '@/lib/utils';
import type { DiaryEntry } from '@/lib/types';

export function DiaryEntryCard({ entry }: { entry: DiaryEntry }) {
  const [expanded, setExpanded] = useState(false);
  const preview = entry.content.slice(0, 150);
  const hasMore = entry.content.length > 150;

  return (
    <div className="card-sm cursor-pointer hover:border-slate-700 transition-colors"
         onClick={() => setExpanded(!expanded)}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-slate-300 capitalize">
          {formatDate(entry.date)}
        </p>
        <span className="text-slate-600 text-xs">{expanded ? '▲' : '▼'}</span>
      </div>
      <p className="text-slate-500 text-sm leading-relaxed">
        {expanded ? entry.content : preview}
        {!expanded && hasMore && '...'}
      </p>
    </div>
  );
}
