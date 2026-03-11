export const dynamic = 'force-dynamic';

import { db } from '@/lib/firebase';
import { toDateString, getLast7Days, formatDate } from '@/lib/utils';
import { StreakCard } from '@/components/StreakCard';
import { HabitCardMini } from '@/components/HabitCardMini';
import { WeekCalendar } from '@/components/WeekCalendar';
import type { Habit, HabitLog, HabitWithLog } from '@/lib/types';

async function getTodayData() {
  const today = toDateString(new Date());
  const last7 = getLast7Days();

  const habitsSnap = await db.collection('habits')
    .where('active', '==', true)
    .orderBy('sortOrder')
    .get();
  const habits = habitsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Habit));

  const logsSnap = await db.collection('habit_logs')
    .where('date', '==', today)
    .get();
  const todayLogs = logsSnap.docs.map(d => ({ id: d.id, ...d.data() } as HabitLog));

  const weekLogsSnap = await db.collection('habit_logs')
    .where('date', 'in', last7)
    .get();
  const weekLogs = weekLogsSnap.docs.map(d => ({ id: d.id, ...d.data() } as HabitLog));

  const phrasesSnap = await db.collection('motivational_phrases').limit(10).get();
  const phrases = phrasesSnap.docs.map(d => d.data());
  const phrase = phrases.length > 0 ? phrases[new Date().getDay() % phrases.length] : null;

  const habitsWithLogs: HabitWithLog[] = habits.map(h => ({
    ...h,
    log: todayLogs.find(l => l.habitId === h.id),
  }));

  return { habitsWithLogs, weekLogs, phrase, today };
}

async function getStreak(): Promise<number> {
  const logsSnap = await db.collection('habit_logs')
    .where('completed', '==', true)
    .orderBy('date', 'desc')
    .limit(200)
    .get();

  if (logsSnap.empty) return 0;

  const dateSet = new Set(logsSnap.docs.map(d => d.data().date as string));
  let streak = 0;
  const today = new Date();

  for (let i = 0; i < 200; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const ds = toDateString(d);
    if (dateSet.has(ds)) streak++;
    else if (i > 0) break;
  }
  return streak;
}

export default async function HomePage() {
  const [{ habitsWithLogs, weekLogs, phrase, today }, streak] =
    await Promise.all([getTodayData(), getStreak()]);

  const completed = habitsWithLogs.filter(h => h.log?.completed).length;
  const total = habitsWithLogs.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Buenos días, Agustín 👋</h1>
        <p className="text-slate-400 mt-1 capitalize">{formatDate(today)}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StreakCard streak={streak} />
        <div className="card md:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-slate-400">Progreso de hoy</p>
              <p className="text-3xl font-bold text-white mt-1">{pct}%</p>
            </div>
            <p className="text-slate-500 text-sm">{completed}/{total} hábitos</p>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-3">
            <div className="bg-brand-500 h-3 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
          {pct === 100 && (
            <p className="text-green-400 text-sm mt-2 font-medium">¡Perfecto! Todos los hábitos cumplidos 🎉</p>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-white mb-3">Hábitos de hoy</h2>
        <div className="space-y-2">
          {habitsWithLogs.map(h => <HabitCardMini key={h.id} habit={h} />)}
        </div>
      </div>

      {phrase && (
        <div className="card border-l-4 border-brand-500">
          <p className="text-slate-300 italic text-sm leading-relaxed">&ldquo;{phrase.phrase}&rdquo;</p>
          {phrase.author && <p className="text-slate-500 text-xs mt-2">— {phrase.author}</p>}
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-white mb-3">Últimos 7 días</h2>
        <WeekCalendar logs={weekLogs} totalHabits={total} />
      </div>
    </div>
  );
}
