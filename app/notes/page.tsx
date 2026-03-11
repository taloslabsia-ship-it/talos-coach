import { db } from '@/lib/firebase';
import { NoteCard } from '@/components/NoteCard';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/lib/utils';
import type { Note, NoteCategory } from '@/lib/types';

export const dynamic = 'force-dynamic';

const CATEGORIES: NoteCategory[] = ['prompt', 'idea', 'compras', 'trabajo', 'personal'];

async function getNotes(category?: string) {
  let q = db.collection('notes').orderBy('createdAt', 'desc').limit(100);
  if (category && category !== 'all') {
    q = db.collection('notes').where('category', '==', category).orderBy('createdAt', 'desc').limit(100);
  }
  const snap = await q.get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Note));
}

interface PageProps {
  searchParams: { cat?: string };
}

export default async function NotesPage({ searchParams }: PageProps) {
  const activeCategory = searchParams.cat ?? 'all';
  const notes = await getNotes(activeCategory);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Notas</h1>
          <p className="text-slate-400 text-sm mt-1">Guardadas por TALOS o manualmente · {notes.length} notas</p>
        </div>
        <span className="text-2xl">📌</span>
      </div>

      <div className="flex flex-wrap gap-2">
        <a href="/notes" className={`badge cursor-pointer transition-colors ${activeCategory === 'all' ? 'bg-brand-500/20 text-brand-300' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}>
          Todas
        </a>
        {CATEGORIES.map(cat => (
          <a key={cat} href={`/notes?cat=${cat}`} className={`badge cursor-pointer transition-colors ${activeCategory === cat ? 'bg-brand-500/20 text-brand-300' : `${CATEGORY_COLORS[cat]} opacity-70 hover:opacity-100`}`}>
            {CATEGORY_LABELS[cat]}
          </a>
        ))}
      </div>

      {notes.length > 0 ? (
        <div className="space-y-3">
          {notes.map(note => <NoteCard key={note.id} note={note} />)}
        </div>
      ) : (
        <div className="card text-center py-16">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-slate-500">No hay notas en esta categoría.</p>
          <p className="text-slate-600 text-sm mt-1">TALOS puede guardar notas via API, o podés crearlas desde Telegram.</p>
        </div>
      )}
    </div>
  );
}
