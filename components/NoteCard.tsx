'use client';

import { useState, useTransition } from 'react';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/lib/utils';
import { deleteNote, toggleNoteCompleted } from '@/app/actions';
import type { Note } from '@/lib/types';

export function NoteCard({ note }: { note: Note }) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [localCompleted, setLocalCompleted] = useState(note.completed ?? false);

  const isPendiente = note.category === 'pendiente';

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(note.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('¿Eliminar esta nota?')) return;
    startTransition(async () => { await deleteNote(note.id); });
  };

  const handleToggleCompleted = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !localCompleted;
    setLocalCompleted(next);
    startTransition(async () => { await toggleNoteCompleted(note.id, next); });
  };

  const preview = note.content.slice(0, 200);
  const hasMore = note.content.length > 200;
  const date = note.createdAt
    ? new Date(note.createdAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';

  return (
    <div
      className={`border rounded-2xl p-4 cursor-pointer transition-all duration-300 ${
        localCompleted && isPendiente
          ? 'opacity-50 bg-white/[0.01] border-white/[0.04]'
          : 'bg-white/[0.03] border-white/[0.07] hover:border-primary-500/20'
      } ${isPending ? 'opacity-60' : ''}`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox solo para pendiente */}
        {isPendiente && (
          <button
            onClick={handleToggleCompleted}
            className={`mt-0.5 w-5 h-5 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${
              localCompleted
                ? 'border-primary-500 bg-primary-500 neon-glow-sm'
                : 'border-slate-600 hover:border-primary-500/50'
            }`}
          >
            {localCompleted && (
              <svg className="w-3 h-3" style={{ color: '#0a1414' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        )}

        <div className="flex-1 min-w-0">
          {/* Badge + fecha */}
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className={`badge text-[10px] ${CATEGORY_COLORS[note.category]}`}>
              {CATEGORY_LABELS[note.category]}
            </span>
            {note.source === 'talos' && (
              <span className="badge text-[10px]" style={{ background: 'rgba(13,242,242,0.08)', color: '#0df2f2', border: '1px solid rgba(13,242,242,0.15)' }}>
                ⚡ TALOS
              </span>
            )}
            {date && <span className="text-slate-600 text-[10px] font-mono">{date}</span>}
          </div>

          {/* Título */}
          <p className={`font-semibold text-sm transition-all ${localCompleted && isPendiente ? 'line-through text-slate-500' : 'text-white'}`}>
            {note.title}
          </p>

          {/* Contenido */}
          <p className="text-slate-500 text-sm mt-1 leading-relaxed">
            {expanded ? note.content : preview}
            {!expanded && hasMore && <span className="text-slate-600"> ···</span>}
          </p>

          {expanded && hasMore && (
            <button
              className="text-xs mt-1 transition-colors"
              style={{ color: 'rgba(13,242,242,0.5)' }}
              onClick={e => { e.stopPropagation(); setExpanded(false); }}
            >
              Ver menos
            </button>
          )}
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
          <button
            onClick={handleCopy}
            className="text-slate-500 hover:text-primary-400 p-1.5 rounded-xl transition-colors"
            title="Copiar"
          >
            <span className="material-symbols-outlined text-lg"
              style={{ fontVariationSettings: copied ? "'FILL' 1" : "'FILL' 0", color: copied ? '#0df2f2' : undefined }}>
              {copied ? 'check' : 'content_copy'}
            </span>
          </button>
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="text-slate-600 hover:text-red-400 p-1.5 rounded-xl transition-colors"
            title="Eliminar"
          >
            <span className="material-symbols-outlined text-lg">delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}
