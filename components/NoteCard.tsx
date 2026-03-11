'use client';

import { useState, useTransition } from 'react';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/lib/utils';
import { deleteNote } from '@/app/actions';
import type { Note } from '@/lib/types';

export function NoteCard({ note }: { note: Note }) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(note.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('¿Eliminar esta nota?')) return;
    startTransition(async () => {
      await deleteNote(note.id);
    });
  };

  const preview = note.content.slice(0, 200);
  const hasMore = note.content.length > 200;
  const date = new Date(note.createdAt).toLocaleDateString('es-AR', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <div
      className="card hover:border-slate-700 transition-colors cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`badge ${CATEGORY_COLORS[note.category]}`}>
              {CATEGORY_LABELS[note.category]}
            </span>
            {note.source === 'talos' && (
              <span className="badge bg-brand-900/50 text-brand-400">⚡ TALOS</span>
            )}
            <span className="text-slate-600 text-xs">{date}</span>
          </div>
          <p className="text-white font-medium text-sm">{note.title}</p>
          <p className="text-slate-500 text-sm mt-1 leading-relaxed">
            {expanded ? note.content : preview}
            {!expanded && hasMore && '...'}
          </p>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={handleCopy}
            className="btn-ghost text-xs px-2.5 py-1.5"
            title="Copiar contenido"
          >
            {copied ? '✓ Copiado' : '📋 Copiar'}
          </button>
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="text-slate-600 hover:text-red-400 px-2 py-1.5 rounded-lg transition-colors text-sm"
            title="Eliminar nota"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}
