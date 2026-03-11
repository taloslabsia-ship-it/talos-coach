import { db } from '@/lib/firebase';
import { getLast30Days } from '@/lib/utils';
import { WeekBarChart } from '@/components/WeekBarChart';
import { MonthHeatmap } from '@/components/MonthHeatmap';
import type { Habit, HabitLog, DayStats } from '@/lib/types';

export const dynamic = 'force-dynamic';

async function getStatsData() {
  const last30 = getLast30Days();

  const habitsSnap = await db.collection('habits').where('active', '==', true).get();
  const habits = habitsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Habit));
  const totalHabits = habits.length;

  // Firestore 'in' permite máximo 30 valores — perfecto para 30 días
  const logsSnap = await db.collection('habit_logs')
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

  // Ranking de hábitos
  const habitCounts: Record<string, number> = {};
  for (const log of logs) {
    if (log.completed) habitCounts[log.habitId] = (habitCounts[log.habitId] ?? 0) + 1;
  }
  const ranked = habits
    .map(h => ({ ...h, count: habitCounts[h.id] ?? 0 }))
    .sort((a, b) => b.count - a.count);

  return { dayStats, ranked };
}

export default async function StatsPage() {
  const { dayStats, ranked } = await getStatsData();

  const last7 = dayStats.slice(-7);
  const avgPct = dayStats.length > 0
    ? Math.round(dayStats.reduce((s, d) => s + d.percentage, 0) / dayStats.length)
    : 0;
  const best = ranked[0];
  const worst = ranked[ranked.length - 1];

  return (
    <div className="space-y-6">
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
    </div>
  );
}
