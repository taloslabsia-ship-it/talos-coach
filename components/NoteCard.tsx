'use client';

import { useState, useTransition } from 'react';
import ReactMarkdown from 'react-markdown';
import { STATUS_COLORS, STATUS_LABELS, getTab } from '@/lib/utils';
import { deleteNote, updateNoteStatus, updateNote } from '@/app/actions';
import type { Note, TaskStatus } from '@/lib/types';

const STATUS_CYCLE: TaskStatus[] = ['pendiente', 'en_progreso', 'completada'];

const STATUS_ICONS: Record<TaskStatus, string> = {
  pendiente:   'radio_button_unchecked',
  en_progreso: 'pending',
  completada:  'task_alt',
};

const CATEGORY_OPTIONS = [
  { value: 'tarea',    label: 'Tarea',    tab: 'tareas' },
  { value: 'pendiente',label: 'Pendiente',tab: 'tareas' },
  { value: 'nota',     label: 'Nota',     tab: 'notas'  },
  { value: 'personal', label: 'Personal', tab: 'notas'  },
  { value: 'trabajo',  label: 'Trabajo',  tab: 'notas'  },
  { value: 'idea',     label: 'Idea',     tab: 'ideas'  },
  { value: 'prompt',   label: 'Prompt',   tab: 'ideas'  },
];

function nextStatus(current: TaskStatus): TaskStatus {
  const idx = STATUS_CYCLE.indexOf(current);
  return STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
}

export function NoteCard({ note }: { note: Note }) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(note.title);
  const [editContent, setEditContent] = useState(note.content);
  const [editCategory, setEditCategory] = useState<string>(note.category);
  const [isPending, startTransition] = useTransition();

  const isTask = getTab(note.category) === 'tareas';
  const currentStatus: TaskStatus = note.status ?? (note.completed ? 'completada' : 'pendiente');
  const [localStatus, setLocalStatus] = useState<TaskStatus>(currentStatus);

  const isDone = localStatus === 'completada';

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

  const handleCycleStatus = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = nextStatus(localStatus);
    setLocalStatus(next);
    startTransition(async () => { await updateNoteStatus(note.id, next); });
  };

  const handleEditOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditCategory(note.category);
    setEditing(true);
  };

  const handleEditSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    startTransition(async () => {
      await updateNote(note.id, { title: editTitle, content: editContent, category: editCategory });
      setEditing(false);
    });
  };

  const handleEditCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditing(false);
  };

  const preview = note.content.slice(0, 200);
  const hasMore = note.content.length > 200;
  const date = note.createdAt
    ? new Date(note.createdAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';

  // Edit mode
  if (editing) {
    return (
      <div className="border rounded-2xl p-4 bg-white/[0.04] border-primary-500/30" onClick={e => e.stopPropagation()}>
        <div className="space-y-3">
          {/* Título */}
          <input
            type="text"
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            placeholder="Título"
            className="input-dark w-full text-sm font-semibold"
            autoFocus
          />

          {/* Categoría */}
          <select
            value={editCategory}
            onChange={e => setEditCategory(e.target.value)}
            className="input-dark w-full text-sm"
          >
            {CATEGORY_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label} ({opt.tab})
              </option>
            ))}
          </select>

          {/* Contenido */}
          <textarea
            value={editContent}
            onChange={e => setEditContent(e.target.value)}
            placeholder="Contenido..."
            rows={5}
            className="input-dark w-full text-sm resize-none"
          />

          {/* Acciones */}
          <div className="flex gap-2 justify-end">
            <button
              onClick={handleEditCancel}
              disabled={isPending}
              className="px-4 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleEditSave}
              disabled={isPending || !editTitle.trim()}
              className="px-4 py-1.5 rounded-xl text-xs font-semibold transition-colors"
              style={{ background: 'rgba(13,242,242,0.15)', color: '#0df2f2', border: '1px solid rgba(13,242,242,0.25)' }}
            >
              {isPending ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`border rounded-2xl p-4 cursor-pointer transition-all duration-300 ${
        isDone && isTask
          ? 'opacity-40 bg-white/[0.01] border-white/[0.04]'
          : 'bg-white/[0.03] border-white/[0.07] hover:border-primary-500/20'
      } ${isPending ? 'opacity-60' : ''}`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start gap-3">

        {/* Status toggle (solo para tareas) */}
        {isTask && (
          <button
            onClick={handleCycleStatus}
            title={`${STATUS_LABELS[localStatus]} — clic para avanzar`}
            className={`mt-0.5 flex-shrink-0 transition-all rounded-full ${
              localStatus === 'completada' ? 'text-emerald-400' :
              localStatus === 'en_progreso' ? 'text-blue-400' : 'text-slate-500 hover:text-amber-400'
            }`}
          >
            <span className="material-symbols-outlined text-xl"
              style={{ fontVariationSettings: localStatus === 'completada' ? "'FILL' 1" : "'FILL' 0" }}>
              {STATUS_ICONS[localStatus]}
            </span>
          </button>
        )}

        <div className="flex-1 min-w-0">
          {/* Badges + fecha */}
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            {isTask && (
              <span className={`badge text-[10px] ${STATUS_COLORS[localStatus]}`}>
                {STATUS_LABELS[localStatus]}
              </span>
            )}
            {note.source === 'talos' && (
              <span className="badge text-[10px]" style={{ background: 'rgba(13,242,242,0.08)', color: '#0df2f2', border: '1px solid rgba(13,242,242,0.15)' }}>
                ⚡ TALOS
              </span>
            )}
            {date && <span className="text-slate-600 text-[10px] font-mono">{date}</span>}
          </div>

          {/* Título */}
          <p className={`font-semibold text-sm transition-all ${isDone && isTask ? 'line-through text-slate-500' : 'text-white'}`}>
            {note.title}
          </p>

          {/* Contenido */}
          <div className="text-slate-500 text-sm mt-1 leading-relaxed prose-dark">
            <ReactMarkdown
              components={{
                h1: ({children}) => <p className="font-bold text-slate-300 text-base">{children}</p>,
                h2: ({children}) => <p className="font-bold text-slate-300">{children}</p>,
                h3: ({children}) => <p className="font-semibold text-slate-400">{children}</p>,
                strong: ({children}) => <strong className="text-slate-300 font-semibold">{children}</strong>,
                em: ({children}) => <em className="text-slate-400">{children}</em>,
                li: ({children}) => <li className="ml-4 list-disc text-slate-500">{children}</li>,
                code: ({children}) => <code className="bg-white/5 px-1.5 py-0.5 rounded text-primary-400 text-xs font-mono">{children}</code>,
                a: ({href, children}) => <a href={href} className="text-primary-400 underline" target="_blank" rel="noopener noreferrer">{children}</a>,
                p: ({children}) => <p className="mb-1">{children}</p>,
              }}
            >
              {expanded ? note.content : preview + (!expanded && hasMore ? ' ···' : '')}
            </ReactMarkdown>
          </div>

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
          <button onClick={handleEditOpen} className="text-slate-500 hover:text-primary-400 p-1.5 rounded-xl transition-colors" title="Editar">
            <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 0" }}>edit</span>
          </button>
          <button onClick={handleCopy} className="text-slate-500 hover:text-primary-400 p-1.5 rounded-xl transition-colors" title="Copiar">
            <span className="material-symbols-outlined text-lg"
              style={{ fontVariationSettings: copied ? "'FILL' 1" : "'FILL' 0", color: copied ? '#0df2f2' : undefined }}>
              {copied ? 'check' : 'content_copy'}
            </span>
          </button>
          <button onClick={handleDelete} disabled={isPending} className="text-slate-600 hover:text-red-400 p-1.5 rounded-xl transition-colors" title="Eliminar">
            <span className="material-symbols-outlined text-lg">delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}
