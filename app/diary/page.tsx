import { db, toISO } from '@/lib/firebase';
import { toDateString, formatDate } from '@/lib/utils';
import { DiaryEditor } from '@/components/DiaryEditor';
import { DiaryEntryCard } from '@/components/DiaryEntryCard';
import { DiaryAnalysis } from '@/components/DiaryAnalysis';
import type { DiaryEntry } from '@/lib/types';

export const dynamic = 'force-dynamic';

async function getDiaryData() {
  const today = toDateString(new Date());

  const todayDoc = await db.collection('diary_entries').doc(today).get();
  const todayEntry = todayDoc.exists
    ? (() => { const d = todayDoc.data()!; return { id: todayDoc.id, ...d, createdAt: toISO(d.createdAt) ?? '', updatedAt: toISO(d.updatedAt) ?? '' } as DiaryEntry; })()
    : null;

  const entriesSnap = await db.collection('diary_entries')
    .orderBy('date', 'desc')
    .limit(30)
    .get();
  const entries = entriesSnap.docs.map(d => {
    const data = d.data();
    return { id: d.id, ...data, createdAt: toISO(data.createdAt) ?? '', updatedAt: toISO(data.updatedAt) ?? '' } as DiaryEntry;
  });

  return { todayEntry, entries, today };
}

export default async function DiaryPage() {
  let todayEntry: DiaryEntry | null = null;
  let entries: DiaryEntry[] = [];
  let today = '';
  try {
    ({ todayEntry, entries, today } = await getDiaryData());
  } catch (e: any) {
    return (
      <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 space-y-2">
        <p className="font-bold">Error cargando diario</p>
        <p className="text-sm font-mono">{e?.message}</p>
      </div>
    );
  }
  const pastEntries = entries.filter(e => e.date !== today);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Diario</h1>
        <p className="text-slate-400 text-sm mt-1 capitalize">{formatDate(today)}</p>
      </div>
      <DiaryEditor date={today} initialContent={todayEntry?.content ?? ''} />
      {(todayEntry || pastEntries.length > 0) && (
        <>
          <DiaryAnalysis entries={entries} />
          <div>
            <h2 className="text-lg font-semibold text-white mb-3">Entradas</h2>
            <div className="space-y-3">
              {entries.map(entry => <DiaryEntryCard key={entry.id} entry={entry} />)}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
