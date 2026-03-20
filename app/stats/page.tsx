import { userDb } from '@/lib/firebase';
import { getLast30Days, toDateString, cn } from '@/lib/utils';
import { WeekBarChart } from '@/components/WeekBarChart';
import { MonthHeatmap } from '@/components/MonthHeatmap';
import { requireActiveSession } from '@/lib/session';
import type { Habit, HabitLog, DayStats } from '@/lib/types';

export const dynamic = 'force-dynamic';

const BADGES = [
  { days: 7,   emoji: '🥉', label: '7 días',   color: 'border-amber-700/50 bg-amber-950/20',   textColor: 'text-amber-400' },
  { days: 30,  emoji: '🥈', label: '30 días',  color: 'border-slate-500/50 bg-slate-800/50',   textColor: 'text-slate-300' },
  { days: 60,  emoji: '🥇', label: '60 días',  color: 'border-yellow-600/50 bg-yellow-950/20', textColor: 'text-yellow-400' },
  { days: 100, emoji: '👑', label: '100 días', color: 'border-purple-600/50 bg-purple-950/20', textColor: 'text-purple-400' },
];

async function getStreak(uid: string): Promise<number> {
  const udb = userDb(uid);
  const logsSnap = await udb.habitLogs()
    .where('completed', '==', true)
    .orderBy('date', 'desc')
    .limit(300)
    .get();

  if (logsSnap.empty) return 0;

  const dateSet = new Set(logsSnap.docs.map(d => d.data().date as string));
  let streak = 0;
  const today = new Date();

  for (let i = 0; i < 300; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const ds = toDateString(d);
    if (dateSet.has(ds)) streak++;
    else if (i > 0) break;
  }
  return streak;
}

async function getStatsData(uid: string) {
  const last30 = getLast30Days();
  const udb = userDb(uid);

  const habitsSnap = await udb.habits().where('active', '==', true).get();
  const habits = habitsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Habit));
  const totalHabits = habits.length;

  const logsSnap = await udb.habitLogs()
    .where('date', 'in', last30)
    .get();
  const logs = logsSnap.docs.map(d => ({ id: d.id, ...d.data() } as HabitLog));

  const byDate: Record<string, { completed: number }> = {};
  for (const d of last30) byDate[d] = { completed: 0 };
  for (const log of logs) {
    if (log.completed && byDate[log.date]) byDate[log.date].completed++;
  }

  const dayStats: DayStats[] = last30.map(date => ({
    date,
    completed: byDate[date].completed,
    total: totalHabits,
    percentage: totalHabits > 0 ? Math.round((byDate[date].completed / totalHabits) * 100) : 0,
  }));

  const habitCounts: Record<string, number> = {};
  for (const log of logs) {
    if (log.completed) habitCounts[log.habitId] = (habitCounts[log.habitId] ?? 0) + 1;
  }
  const ranked = habits
    .map(h => ({ ...h, count: habitCounts[h.id] ?? 0 }))
    .sort((a, b) => b.count - a.count);

  const allLogsSnap = await udb.habitLogs().where('completed', '==', true).get();
  const totalDays = new Set(allLogsSnap.docs.map(d => d.data().date as string)).size;

  return { dayStats, ranked, totalDays };
}

export default async function StatsPage() {
  let dayStats: DayStats[] = [], ranked: any[] = [], totalDays = 0, streak = 0;
  try {
    const { uid } = await requireActiveSession();
    ([{ dayStats, ranked, totalDays }, streak] = await Promise.all([getStatsData(uid), getStreak(uid)]));
  } catch (e: any) {
    return (
      <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 space-y-2">
        <p className="font-bold">Error cargando estadísticas</p>
        <p className="text-sm font-mono">{e?.message}</p>
      </div>
    );
  }

  const last7 = dayStats.slice(-7);
  const avgPct = dayStats.length > 0
    ? Math.round(dayStats.reduce((s, d) => s + d.percentage, 0) / dayStats.length)
    : 0;
  const best = ranked[0];
  const worst = ranked[ranked.length - 1];
  const nextBadge = BADGES.find(b => streak < b.days);
  const prevBadge = nextBadge ? BADGES[BADGES.indexOf(nextBadge) - 1] : null;
  const badgePct = nextBadge
    ? Math.round(((streak - (prevBadge?.days ?? 0)) / (nextBadge.days - (prevBadge?.days ?? 0))) * 100)
    : 100;

  return (
    <div className="space-y-6">

      {/* ── ESTADÍSTICAS ── */}
      <div>
        <h1 className="text-2xl font-bold text-white">Estadísticas</h1>
        <p className="text-slate-400 text-sm mt-1">Últimos 30 días</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-3xl font-bold text-brand-400">{avgPct}%</p>
          <p className="text-slate-500 text-xs mt-1">Promedio mensual</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-green-400">{dayStats.filter(d => d.percentage === 100).length}</p>
          <p className="text-slate-500 text-xs mt-1">Días perfectos</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-orange-400">{dayStats.filter(d => d.percentage > 0).length}</p>
          <p className="text-slate-500 text-xs mt-1">Días activos</p>
        </div>
      </div>

      <div className="card">
        <h2 className="text-base font-semibold text-white mb-4">Últimos 7 días</h2>
        <WeekBarChart data={last7} />
      </div>

      <div className="card">
        <h2 className="text-base font-semibold text-white mb-4">Heatmap mensual</h2>
        <MonthHeatmap data={dayStats} />
      </div>

      {ranked.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {best && (
            <div className="card border-green-800/40">
              <p className="text-xs text-slate-500 mb-1">Hábito más cumplido</p>
              <p className="text-2xl">{best.emoji}</p>
              <p className="text-white font-medium text-sm mt-1">{best.name}</p>
              <p className="text-green-400 text-xs mt-1">{best.count} veces este mes</p>
            </div>
          )}
          {worst && worst.id !== best?.id && (
            <div className="card border-red-900/30">
              <p className="text-xs text-slate-500 mb-1">Hábito menos cumplido</p>
              <p className="text-2xl">{worst.emoji}</p>
              <p className="text-white font-medium text-sm mt-1">{worst.name}</p>
              <p className="text-red-400 text-xs mt-1">{worst.count} veces este mes</p>
            </div>
          )}
        </div>
      )}

      {/* ── LOGROS ── */}
      <div className="pt-2 border-t" style={{ borderColor: 'rgba(13,242,242,0.12)' }}>
        <h2 className="text-2xl font-bold text-white">Logros</h2>
        <p className="text-slate-400 text-sm mt-1">
          {totalDays} días activos en total · Racha actual: {streak} días 🔥
        </p>
      </div>

      {nextBadge && (
        <div className="card">
          <p className="text-sm text-slate-400 mb-2">
            Próximo logro: <span className="text-white font-medium">{nextBadge.emoji} {nextBadge.label}</span>
          </p>
          <div className="w-full bg-slate-800 rounded-full h-2.5">
            <div className="bg-brand-500 h-2.5 rounded-full transition-all" style={{ width: `${Math.min(badgePct, 100)}%` }} />
          </div>
          <p className="text-slate-500 text-xs mt-2">{streak} / {nextBadge.days} días ({badgePct}%)</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {BADGES.map(badge => {
          const unlocked = streak >= badge.days;
          return (
            <div key={badge.days} className={cn('card flex flex-col items-center py-8 border-2 transition-all', unlocked ? badge.color : 'border-slate-800 opacity-40 grayscale')}>
              <span className={cn('text-6xl mb-3', !unlocked && 'blur-sm')}>{unlocked ? badge.emoji : '🔒'}</span>
              <p className={cn('font-bold text-lg', unlocked ? badge.textColor : 'text-slate-600')}>{badge.label}</p>
              <p className="text-slate-500 text-xs mt-1">{unlocked ? '¡Desbloqueado!' : `Faltan ${badge.days - streak} días`}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-2xl font-bold text-brand-400">{streak}</p>
          <p className="text-slate-500 text-xs mt-1">Racha actual</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-green-400">{totalDays}</p>
          <p className="text-slate-500 text-xs mt-1">Días totales</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-purple-400">{BADGES.filter(b => streak >= b.days).length}</p>
          <p className="text-slate-500 text-xs mt-1">Logros obtenidos</p>
        </div>
      </div>

    </div>
  );
}
