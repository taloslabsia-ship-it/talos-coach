'use client';

import { useState, useMemo } from 'react';
import type { DiaryEntry } from '@/lib/types';

const STOP_WORDS = new Set([
  'de','la','el','en','y','a','los','las','un','una','que','es','se','con','por',
  'para','del','al','lo','su','sus','pero','más','como','no','me','te','le','nos',
  'les','si','ya','fue','ser','está','han','hay','tiene','tengo','todo','cuando',
  'mi','mis','también','muy','bien','hoy','día','días','vez','todo','cada',
  'the','and','is','in','to','of','a','for','with','it','this','that','was',
]);

interface Props {
  entries: DiaryEntry[];
}

export function DiaryAnalysis({ entries }: Props) {
  const [open, setOpen] = useState(false);

  // Last 7 days entries
  const weekEntries = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    return entries.filter(e => new Date(e.date) >= cutoff);
  }, [entries]);

  const stats = useMemo(() => {
    if (weekEntries.length === 0) return null;

    const totalChars = weekEntries.reduce((sum, e) => sum + e.content.length, 0);
    const avgChars = Math.round(totalChars / weekEntries.length);

    // Word frequency
    const freq: Record<string, number> = {};
    for (const entry of weekEntries) {
      const words = entry.content
        .toLowerCase()
        .replace(/[^a-záéíóúüñ\s]/gi, ' ')
        .split(/\s+/)
        .filter(w => w.length > 3 && !STOP_WORDS.has(w));
      for (const w of words) {
        freq[w] = (freq[w] ?? 0) + 1;
      }
    }

    const topWords = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);

    return { count: weekEntries.length, avgChars, topWords, totalChars };
  }, [weekEntries]);

  return (
    <div className="border rounded-2xl overflow-hidden" style={{ borderColor: 'rgba(13,242,242,0.12)' }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left transition-colors hover:bg-white/[0.02]"
      >
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-xl" style={{ color: '#0df2f2', fontVariationSettings: "'FILL' 1" }}>
            auto_awesome
          </span>
          <div>
            <p className="text-sm font-semibold text-white">Análisis semanal</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">
              Últimos 7 días · {weekEntries.length} {weekEntries.length === 1 ? 'entrada' : 'entradas'}
            </p>
          </div>
        </div>
        <span className="material-symbols-outlined text-slate-500">{open ? 'expand_less' : 'expand_more'}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 border-t space-y-4" style={{ borderColor: 'rgba(13,242,242,0.08)' }}>
          {!stats ? (
            <p className="text-slate-500 text-sm text-center py-4">Sin entradas esta semana.</p>
          ) : (
            <>
              {/* KPIs */}
              <div className="grid grid-cols-3 gap-3 pt-4">
                <div className="text-center">
                  <p className="text-2xl font-black text-white">{stats.count}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">Entradas</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-white">{stats.avgChars}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">Avg. chars</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-white">{stats.totalChars}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">Total chars</p>
                </div>
              </div>

              {/* Top words */}
              {stats.topWords.length > 0 && (
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2 font-semibold">Palabras más frecuentes</p>
                  <div className="flex flex-wrap gap-2">
                    {stats.topWords.map(([word, count]) => (
                      <span
                        key={word}
                        className="badge text-xs px-3 py-1"
                        style={{
                          background: `rgba(13,242,242,${Math.min(0.05 + count * 0.03, 0.2)})`,
                          color: `rgba(13,242,242,${Math.min(0.5 + count * 0.1, 1)})`,
                          border: '1px solid rgba(13,242,242,0.15)',
                          fontSize: `${Math.min(0.65 + count * 0.03, 0.85)}rem`,
                        }}
                      >
                        {word} <span className="opacity-50">×{count}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
