export const dynamic = 'force-dynamic';

import { db, toISO } from '@/lib/firebase';
import { NotesClient } from '@/components/NotesClient';
import type { Note } from '@/lib/types';

async function getAllNotes(): Promise<Note[]> {
  const snap = await db.collection('notes').orderBy('createdAt', 'desc').limit(200).get();
  return snap.docs.map(d => {
    const data = d.data();
    return {
      id: d.id,
      title: data.title ?? '',
      content: data.content ?? '',
      category: data.category ?? 'personal',
      source: data.source ?? 'manual',
      completed: data.completed ?? false,
      createdAt: toISO(data.createdAt) ?? '',
      updatedAt: toISO(data.updatedAt) ?? '',
    } as Note;
  });
}

export default async function NotesPage() {
  let notes: Note[] = [];
  try {
    notes = await getAllNotes();
  } catch (e: any) {
    return (
      <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 space-y-2">
        <p className="font-bold">Error cargando notas</p>
        <p className="text-sm font-mono">{e?.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">Notas</h1>
          <p className="text-[10px] uppercase tracking-widest font-semibold mt-0.5" style={{ color: 'rgba(13,242,242,0.6)' }}>
            {notes.length} notas guardadas
          </p>
        </div>
        <div className="size-10 flex items-center justify-center rounded-2xl"
          style={{ background: 'rgba(13,242,242,0.08)', border: '1px solid rgba(13,242,242,0.15)' }}>
          <span className="material-symbols-outlined" style={{ color: '#0df2f2', fontVariationSettings: "'FILL' 1" }}>
            sticky_note_2
          </span>
        </div>
      </header>

      <NotesClient notes={notes} />
    </div>
  );
}
