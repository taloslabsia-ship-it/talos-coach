'use client';

import { useState, useTransition } from 'react';
import { saveDiaryEntry } from '@/app/actions';

interface Props {
  date: string;
  initialContent: string;
}

export function DiaryEditor({ date, initialContent }: Props) {
  const [content, setContent] = useState(initialContent);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    startTransition(async () => {
      await saveDiaryEntry(date, content);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  };

  return (
    <div className="card space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-white">✍️ Pensamientos de hoy</p>
        {saved && <span className="text-green-400 text-sm">Guardado ✓</span>}
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="¿Qué tenés en mente hoy? Escribí libremente..."
        className="w-full bg-slate-800 rounded-xl p-4 text-slate-200 placeholder-slate-600 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[160px]"
      />
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isPending || !content.trim()}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? 'Guardando...' : 'Guardar entrada'}
        </button>
      </div>
    </div>
  );
}
