import { db } from '@/lib/firebase';
import { toDateString, formatDate } from '@/lib/utils';
import { DiaryEditor } from '@/components/DiaryEditor';
import { DiaryEntryCard } from '@/components/DiaryEntryCard';
import type { DiaryEntry } from '@/lib/types';

export const dynamic = 'force-dynamic';

async function getDiaryData() {
  const today = toDateString(new Date());

  const todayDoc = await db.collection('diary_entries').doc(today).get();
  const todayEntry = todayDoc.exists ? { id: todayDoc.id, ...todayDoc.data() } as DiaryEntry : null;

  const entriesSnap = await db.collection('diary_entries')
    .orderBy('date', 'desc')
    .limit(30)
    .get();
  const entries = entriesSnap.docs.map(d => ({ id: d.id, ...d.data() } as DiaryEntry));

  return { todayEntry, entries, today };
}

export default async function DiaryPage() {
  const { todayEntry, entries, today } = await getDiaryData();
  const pastEntries = entries.filter(e => e.date !== today);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Diario</h1>
        <p className="text-slate-400 text-sm mt-1 capitalize">{formatDate(today)}</p>
      </div>
      <DiaryEditor date={today} initialContent={todayEntry?.content ?? ''} />
      {pastEntries.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-3">Entradas anteriores</h2>
          <div className="space-y-3">
            {pastEntries.map(entry => <DiaryEntryCard key={entry.id} entry={entry} />)}
          </div>
        </div>
      )}
    </div>
  );
}
