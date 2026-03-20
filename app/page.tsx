export const dynamic = 'force-dynamic';

import Image from 'next/image';
import Link from 'next/link';
import { db, toISO } from '@/lib/firebase';
import { toDateString, getLast7Days, formatDate } from '@/lib/utils';
import { HabitCardMini } from '@/components/HabitCardMini';
import { WeekCalendar } from '@/components/WeekCalendar';
import { getUserProfile } from '@/app/actions';
import type { Habit, HabitLog, HabitWithLog } from '@/lib/types';

async function getTodayData() {
  const today = toDateString(new Date());
  const last7 = getLast7Days();

  const habitsSnap = await db.collection('habits')
    .where('active', '==', true)
    .orderBy('sortOrder')
    .get();
  
  const habits = habitsSnap.docs.map(d => {
    const data = d.data();
    return {
      id: d.id,
      name: data.name || '',
      emoji: data.emoji || '',
      timeLabel: data.timeLabel || null,
      sortOrder: data.sortOrder || 0,
      active: !!data.active,
      description: data.description || null,
      createdAt: toISO(data.createdAt) || ''
    } as Habit;
  });

  const logsSnap = await db.collection('habit_logs')
    .where('date', '==', today)
    .get();
  
  const todayLogs = logsSnap.docs.map(d => {
    const data = d.data();
    return {
      id: d.id,
      habitId: data.habitId || '',
      completed: !!data.completed,
      date: data.date || today,
      completedAt: toISO(data.completedAt),
      createdAt: toISO(data.createdAt) || '',
      note: data.note || null
    } as HabitLog;
  });

  const weekLogsSnap = await db.collection('habit_logs')
    .where('date', 'in', last7)
    .get();
  
  const weekLogs = weekLogsSnap.docs.map(d => {
    const data = d.data();
    return { 
      date: data.date, 
      completed: !!data.completed 
    };
  }) as any[];

  const phrasesSnap = await db.collection('motivational_phrases').limit(20).get();
  const phrases = phrasesSnap.docs.map(d => {
    const data = d.data();
    return {
      phrase: data.phrase || '',
      author: data.author || null
    };
  });
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
  try {
    const [{ habitsWithLogs, weekLogs, phrase, today }, streak, profile] =
      await Promise.all([getTodayData(), getStreak(), getUserProfile().catch(() => null)]);

    const completed = habitsWithLogs.filter(h => h.log?.completed).length;
    const total = habitsWithLogs.length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (pct / 100) * circumference;

    // Static greeting to avoid hydration mismatch
    const greeting = 'Hola'; 

    return (
      <div className="space-y-6">

        {/* Onboarding banner */}
        {!profile?.onboardingDone && (
          <Link href="/settings" className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all"
            style={{ background: 'rgba(13,242,242,0.08)', border: '1px solid rgba(13,242,242,0.25)' }}>
            <span className="material-symbols-outlined text-xl" style={{ color: '#0df2f2', fontVariationSettings: "'FILL' 1" }}>tune</span>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm">Configurá tu coach</p>
              <p className="text-slate-400 text-xs">Elegí la personalidad del asistente para empezar</p>
            </div>
            <span className="material-symbols-outlined text-lg text-slate-500">chevron_right</span>
          </Link>
        )}

        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative size-12 flex items-center justify-center animate-float">
              <div className="absolute inset-0 orb-glow opacity-50 rounded-full animate-glow-pulse" />
              <Image
                src="/icon-192.png"
                alt="TALOS Logo"
                width={44}
                height={44}
                className="relative z-10 rounded-xl"
              />
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
            {habitsWithLogs.map((h, i) => (
              <div key={h.id} className="animate-in" style={{ animationDelay: `${i * 60}ms` }}>
                <HabitCardMini habit={h} />
              </div>
            ))}
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
  } catch (error: any) {
    console.error('CRITICAL SERVER ERROR:', error);
    return (
      <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 space-y-4">
        <h1 className="text-xl font-bold">Error de Servidor (Debug)</h1>
        <p className="text-sm font-mono break-all">{error.message || 'Error desconocido'}</p>
        <pre className="text-[10px] bg-black/40 p-4 rounded-xl overflow-auto max-h-[300px]">
          {error.stack}
        </pre>
        <p className="text-xs text-slate-500 italic text-center">Agregá este error al chat para que pueda arreglarlo.</p>
      </div>
    );
  }
}
