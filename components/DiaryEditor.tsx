'use client';

import { useState } from 'react';

interface Props {
  date: string;
  initialContent: string;
}

export function DiaryEditor({ date, initialContent }: Props) {
  const [content, setContent] = useState(initialContent);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleSave = async () => {
    if (isPending || !content.trim()) return;
    setError(null);
    setIsPending(true);
    try {
      const res = await fetch('/api/diary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, content }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Error ${res.status}`);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      console.error('Error guardando diario:', err);
      setError(err.message ?? 'Error al guardar. Intentá de nuevo.');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="card-neon space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-xl" style={{ color: '#0df2f2', fontVariationSettings: "'FILL' 1" }}>edit_note</span>
          <p className="font-bold text-white text-sm uppercase tracking-widest">Pensamientos de hoy</p>
        </div>
        {saved && (
          <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: '#0df2f2' }}>
            <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            Guardado
          </span>
        )}
      </div>
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="¿Qué tenés en mente hoy? Escribí libremente..."
        className="input-dark resize-none min-h-[160px] text-sm"
      />
      {error && (
        <p className="text-red-400 text-xs font-medium">{error}</p>
      )}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isPending || !content.trim()}
          className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none text-sm"
        >
          {isPending ? 'Guardando...' : 'Guardar entrada'}
        </button>
      </div>
    </div>
  );
}
