export const dynamic = 'force-dynamic';

import { db } from '@/lib/firebase';
import { toDateString, getLast7Days, formatDate } from '@/lib/utils';
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

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative size-11 flex items-center justify-center">
            <div className="absolute inset-0 orb-glow opacity-50 rounded-full" />
            <span className="material-symbols-outlined text-3xl relative z-10"
              style={{ color: '#0df2f2', fontVariationSettings: "'FILL' 1" }}>
              radio_button_checked
            </span>
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">{greeting}, Agustín</h1>
            <p className="text-[10px] uppercase tracking-widest font-semibold capitalize" style={{ color: 'rgba(13,242,242,0.6)' }}>
              {formatDate(today)}
            </p>
          </div>
        </div>
      </header>

      {/* Progress circular + Streak */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card-neon flex flex-col items-center justify-center py-4 gap-1">
          <div className="relative w-28 h-28">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
              <circle cx="64" cy="64" r={radius} fill="transparent" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
              <circle
                cx="64" cy="64" r={radius} fill="transparent"
                stroke="#0df2f2" strokeWidth="10" strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                style={{ filter: 'drop-shadow(0 0 6px rgba(13,242,242,0.5))' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-white">{pct}%</span>
              <span className="text-[9px] uppercase tracking-widest text-slate-400">Daily</span>
            </div>
          </div>
          <p className="text-xs text-slate-400">{completed}/{total} hábitos</p>
          {pct === 100 && (
            <span className="badge text-[10px]" style={{ background: 'rgba(13,242,242,0.1)', color: '#0df2f2' }}>¡Perfecto! 🎉</span>
          )}
        </div>

        <div className="card flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute inset-0 orb-glow opacity-15 rounded-full scale-50" />
          <span className="material-symbols-outlined text-4xl mb-1 relative z-10"
            style={{ color: '#0df2f2', fontVariationSettings: "'FILL' 1", textShadow: '0 0 15px rgba(13,242,242,0.4)' }}>
            local_fire_department
          </span>
          <p className="text-3xl font-black text-white relative z-10">{streak}</p>
          <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest relative z-10">
            {streak === 1 ? 'día racha' : 'días racha'}
          </p>
        </div>
      </div>

      {/* Habits */}
      <section>
        <h2 className="section-title mb-3">Hábitos de hoy</h2>
        <div className="space-y-2">
          {habitsWithLogs.map(h => <HabitCardMini key={h.id} habit={h} />)}
          {habitsWithLogs.length === 0 && (
            <p className="text-slate-500 text-sm text-center py-6">No hay hábitos configurados.</p>
          )}
        </div>
      </section>

      {/* Motivational phrase */}
      {phrase && (
        <div className="card-neon relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-10">
            <span className="material-symbols-outlined text-6xl" style={{ color: '#0df2f2' }}>format_quote</span>
          </div>
          <p className="text-slate-300 italic text-sm leading-relaxed relative z-10">&ldquo;{phrase.phrase}&rdquo;</p>
          {phrase.author && (
            <p className="text-xs mt-2 relative z-10 uppercase tracking-widest font-semibold text-slate-500">— {phrase.author}</p>
          )}
        </div>
      )}

      {/* Week calendar */}
      <section>
        <h2 className="section-title mb-3">Últimos 7 días</h2>
        <WeekCalendar logs={weekLogs} totalHabits={total} />
      </section>
    </div>
  );
}
