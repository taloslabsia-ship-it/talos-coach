'use client';

import { useState, useMemo } from 'react';
import { NoteCard } from './NoteCard';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/lib/utils';
import type { Note, NoteCategory } from '@/lib/types';

const ALL_CATEGORIES: NoteCategory[] = ['pendiente', 'prompt', 'idea', 'compras', 'trabajo', 'personal'];

interface Props {
  notes: Note[];
}

export function NotesClient({ notes }: Props) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let list = notes;

    if (activeCategory !== 'all') {
      list = list.filter(n => n.category === activeCategory);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(n =>
        n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
      );
    }

    // Pendientes completadas van al final
    return [...list].sort((a, b) => {
      if (a.category === 'pendiente' && b.category === 'pendiente') {
        if (a.completed && !b.completed) return 1;
        if (!a.completed && b.completed) return -1;
      }
      return 0; // mantiene orden por fecha (ya viene ordenado del server)
    });
  }, [notes, activeCategory, search]);

  const pendienteCount = notes.filter(n => n.category === 'pendiente' && !n.completed).length;

  return (
    <div className="space-y-5">
      {/* Search */}
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xl">search</span>
        <input
          type="text"
          placeholder="Buscar notas..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-dark pl-10"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        )}
      </div>

      {/* Category pills */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setActiveCategory('all')}
          className={`badge cursor-pointer transition-all px-3 py-1.5 ${
            activeCategory === 'all'
              ? 'bg-primary-500/15 text-primary-400 border border-primary-500/30'
              : 'bg-white/5 text-slate-400 border border-white/10 hover:border-white/20'
          }`}
        >
          Todas · {notes.length}
        </button>
        {ALL_CATEGORIES.map(cat => {
          const count = notes.filter(n => n.category === cat).length;
          if (count === 0) return null;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`badge cursor-pointer transition-all px-3 py-1.5 ${
                activeCategory === cat
                  ? CATEGORY_COLORS[cat]
                  : 'bg-white/5 text-slate-400 border border-white/10 hover:border-white/20'
              }`}
            >
              {CATEGORY_LABELS[cat]} · {count}
            </button>
          );
        })}
      </div>

      {/* Pending alert */}
      {pendienteCount > 0 && (activeCategory === 'all' || activeCategory === 'pendiente') && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium"
          style={{ background: 'rgba(13,242,242,0.06)', border: '1px solid rgba(13,242,242,0.15)', color: '#0df2f2' }}>
          <span className="material-symbols-outlined text-base">pending_actions</span>
          {pendienteCount} {pendienteCount === 1 ? 'tarea pendiente' : 'tareas pendientes'}
        </div>
      )}

      {/* Notes list */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map(note => <NoteCard key={note.id} note={note} />)}
        </div>
      ) : (
        <div className="card text-center py-16">
          <p className="text-4xl mb-3">
            {search ? '🔍' : '📭'}
          </p>
          <p className="text-slate-500 text-sm">
            {search ? `Sin resultados para "${search}"` : 'No hay notas en esta categoría.'}
          </p>
        </div>
      )}
    </div>
  );
}
