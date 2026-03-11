import { db, toISO } from '@/lib/firebase';
import { toDateString } from '@/lib/utils';
import { HabitCard } from '@/components/HabitCard';
import type { Habit, HabitLog, HabitWithLog } from '@/lib/types';

export const dynamic = 'force-dynamic';

async function getHabitsToday() {
  const today = toDateString(new Date());

  const habitsSnap = await db.collection('habits')
    .where('active', '==', true)
    .orderBy('sortOrder')
    .get();
  const habits = habitsSnap.docs.map(d => {
    const data = d.data();
    return { id: d.id, ...data, createdAt: toISO(data.createdAt) ?? '' } as Habit;
  });

  const logsSnap = await db.collection('habit_logs')
    .where('date', '==', today)
    .get();
  const logs = logsSnap.docs.map(d => {
    const data = d.data();
    return {
      id: d.id, ...data,
      completedAt: toISO(data.completedAt),
      createdAt: toISO(data.createdAt) ?? '',
    } as HabitLog;
  });

  return habits.map<HabitWithLog>(h => ({
    ...h,
    log: logs.find(l => l.habitId === h.id),
  }));
}

export default async function HabitsPage() {
  const habits = await getHabitsToday();
  const today = toDateString(new Date());
  const completed = habits.filter(h => h.log?.completed).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Hábitos del día</h1>
          <p className="text-slate-400 text-sm mt-1">{completed} de {habits.length} completados</p>
        </div>
        <span className="text-3xl">{completed === habits.length && habits.length > 0 ? '🎉' : '💪'}</span>
      </div>
      <div className="space-y-3">
        {habits.map(habit => <HabitCard key={habit.id} habit={habit} date={today} />)}
      </div>
      {habits.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-slate-500">No hay hábitos configurados.</p>
        </div>
      )}
    </div>
  );
}
