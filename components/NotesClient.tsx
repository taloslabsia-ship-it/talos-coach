'use client';

import { useState, useMemo, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { signInWithCustomToken } from 'firebase/auth';
import { clientDb, clientAuth } from '@/lib/firebase-client';
import { NoteCard } from './NoteCard';
import { getTab } from '@/lib/utils';
import type { Note } from '@/lib/types';

type Tab = 'tareas' | 'notas' | 'ideas';

const TABS: { id: Tab; label: string; icon: string; emptyMsg: string }[] = [
  { id: 'tareas', label: 'Tareas',  icon: 'checklist',     emptyMsg: 'No hay tareas pendientes.' },
  { id: 'notas',  label: 'Notas',   icon: 'sticky_note_2', emptyMsg: 'No hay notas guardadas.'   },
  { id: 'ideas',  label: 'Ideas',   icon: 'lightbulb',     emptyMsg: 'No hay ideas guardadas.'   },
];

interface Props { notes: Note[]; uid: string }

export function NotesClient({ notes: initialNotes, uid }: Props) {
  const [notes, setNotes]     = useState<Note[]>(initialNotes);
  const [activeTab, setActiveTab] = useState<Tab>('tareas');
  const [search, setSearch]       = useState('');

  // Listener en tiempo real — autentica el cliente con custom token si hace falta
  useEffect(() => {
    if (!uid) return;
    let unsub: (() => void) | null = null;

    async function startListener() {
      // Si el cliente no tiene auth, pedimos un custom token al servidor
      if (!clientAuth.currentUser) {
        try {
          const res = await fetch('/api/auth/client-token');
          if (res.ok) {
            const { token } = await res.json();
            await signInWithCustomToken(clientAuth, token);
          }
        } catch {
          // Si falla, el listener no arranca pero el SSR ya mostró los datos
          return;
        }
      }

      const q = query(
        collection(clientDb, 'users', uid, 'notes'),
        orderBy('createdAt', 'desc'),
        limit(200)
      );

      unsub = onSnapshot(q, (snap) => {
        const updated: Note[] = snap.docs.map(d => {
          const data = d.data();
          const createdAt = data.createdAt?.toDate?.()?.toISOString() ?? data.createdAt ?? '';
          const updatedAt = data.updatedAt?.toDate?.()?.toISOString() ?? data.updatedAt ?? '';
          return {
            id: d.id,
            title: data.title ?? '',
            content: data.content ?? '',
            category: data.category ?? 'personal',
            source: data.source ?? 'manual',
            completed: data.completed ?? false,
            status: data.status,
            createdAt,
            updatedAt,
          } as Note;
        });
        setNotes(updated);
      });
    }

    startListener();
    return () => { if (unsub) unsub(); };
  }, [uid]);

  const counts = useMemo(() => ({
    tareas: notes.filter(n => getTab(n.category) === 'tareas').length,
    notas:  notes.filter(n => getTab(n.category) === 'notas').length,
    ideas:  notes.filter(n => getTab(n.category) === 'ideas').length,
  }), [notes]);

  const pendingTaskCount = useMemo(() =>
    notes.filter(n => getTab(n.category) === 'tareas' && n.status !== 'completada' && !n.completed).length,
  [notes]);

  const filtered = useMemo(() => {
    let list = notes.filter(n => getTab(n.category) === activeTab);

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(n =>
        n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
      );
    }

    // Tareas completadas al fondo
    if (activeTab === 'tareas') {
      return [...list].sort((a, b) => {
        const aDone = a.status === 'completada' || !!a.completed;
        const bDone = b.status === 'completada' || !!b.completed;
        if (aDone && !bDone) return 1;
        if (!aDone && bDone) return -1;
        if (a.status === 'en_progreso' && b.status !== 'en_progreso') return -1;
        if (a.status !== 'en_progreso' && b.status === 'en_progreso') return 1;
        return 0;
      });
    }

    return list;
  }, [notes, activeTab, search]);

  const currentTab = TABS.find(t => t.id === activeTab)!;

  return (
    <div className="space-y-5">

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wide transition-all ${
                isActive
                  ? 'bg-primary-500/15 text-primary-400 border border-primary-500/25'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <span className="material-symbols-outlined text-base"
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                {tab.icon}
              </span>
              <span className="hidden sm:inline">{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                isActive ? 'bg-primary-500/20 text-primary-300' : 'bg-white/5 text-slate-600'
              }`}>
                {counts[tab.id]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xl">search</span>
        <input
          type="text"
          placeholder={`Buscar ${currentTab.label.toLowerCase()}...`}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-dark pl-10"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        )}
      </div>

      {/* Alerta tareas pendientes */}
      {activeTab === 'tareas' && pendingTaskCount > 0 && !search && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium"
          style={{ background: 'rgba(13,242,242,0.06)', border: '1px solid rgba(13,242,242,0.15)', color: '#0df2f2' }}>
          <span className="material-symbols-outlined text-base">pending_actions</span>
          {pendingTaskCount} {pendingTaskCount === 1 ? 'tarea sin completar' : 'tareas sin completar'} — clic en el ícono para avanzar estado
        </div>
      )}

      {/* Lista */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map(note => <NoteCard key={note.id} note={note} />)}
        </div>
      ) : (
        <div className="card text-center py-16">
          <p className="text-4xl mb-3">{search ? '🔍' : activeTab === 'tareas' ? '✅' : activeTab === 'ideas' ? '💡' : '📝'}</p>
          <p className="text-slate-500 text-sm">
            {search ? `Sin resultados para "${search}"` : currentTab.emptyMsg}
          </p>
        </div>
      )}
    </div>
  );
}
