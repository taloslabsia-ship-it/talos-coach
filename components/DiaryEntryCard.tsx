'use client';

import { useState, useTransition } from 'react';
import { formatDate } from '@/lib/utils';
import { deleteDiaryEntry } from '@/app/actions';
import type { DiaryEntry } from '@/lib/types';

export function DiaryEntryCard({ entry }: { entry: DiaryEntry }) {
  const [expanded, setExpanded] = useState(false);
  const [isPending, startTransition] = useTransition();

  const lines = entry.content.split('\n').filter(l => l.trim());
  const preview = lines.slice(0, 3).join('\n');
  const hasMore = lines.length > 3;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('¿Eliminar esta entrada del diario?')) return;
    startTransition(async () => { await deleteDiaryEntry(entry.id); });
  };

  return (
    <div
      className={`border rounded-2xl p-4 cursor-pointer transition-all ${
        isPending ? 'opacity-50' : 'border-white/[0.06] bg-white/[0.02] hover:border-primary-500/20'
      }`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-base" style={{ color: '#0df2f2', fontVariationSettings: "'FILL' 1" }}>
              edit_note
            </span>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 capitalize" suppressHydrationWarning>
              {formatDate(entry.date)}
            </p>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-line">
            {expanded ? entry.content : preview}
            {!expanded && hasMore && <span className="text-slate-600"> ···</span>}
          </p>
          {expanded && hasMore && (
            <button
              className="text-xs mt-2 transition-colors"
              style={{ color: 'rgba(13,242,242,0.5)' }}
              onClick={e => { e.stopPropagation(); setExpanded(false); }}
            >
              Ver menos ▲
            </button>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
          <button
            onClick={e => { e.stopPropagation(); setExpanded(!expanded); }}
            className="text-slate-600 hover:text-slate-400 p-1.5 rounded-xl transition-colors"
          >
            <span className="material-symbols-outlined text-lg">{expanded ? 'expand_less' : 'expand_more'}</span>
          </button>
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="text-slate-600 hover:text-red-400 p-1.5 rounded-xl transition-colors"
            title="Eliminar entrada"
          >
            <span className="material-symbols-outlined text-lg">delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}
