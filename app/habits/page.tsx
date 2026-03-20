import { toISO, userDb } from '@/lib/firebase';
import { toDateString } from '@/lib/utils';
import { HabitCard } from '@/components/HabitCard';
import { AddHabitButton } from '@/components/AddHabitButton';
import { requireActiveSession } from '@/lib/session';
import type { Habit, HabitLog, HabitWithLog } from '@/lib/types';

export const dynamic = 'force-dynamic';

async function getHabitsToday(uid: string) {
  const today = toDateString(new Date());
  const udb = userDb(uid);

  const habitsSnap = await udb.habits()
    .where('active', '==', true)
    .orderBy('sortOrder')
    .get();

  const habits = habitsSnap.docs.map(d => {
    const data = d.data();
    return {
      id: d.id,
      name: data.name || '',
      emoji: data.emoji || '',
      description: data.description || null,
      timeLabel: data.timeLabel || null,
      sortOrder: data.sortOrder || 0,
      active: !!data.active,
      createdAt: toISO(data.createdAt) || ''
    } as Habit;
  });

  const logsSnap = await udb.habitLogs()
    .where('date', '==', today)
    .get();

  const logs = logsSnap.docs.map(d => {
    const data = d.data();
    return {
      id: d.id,
      habitId: data.habitId || '',
      completed: !!data.completed,
      date: data.date || today,
      note: data.note || null,
      completedAt: toISO(data.completedAt),
      createdAt: toISO(data.createdAt) || ''
    } as HabitLog;
  });

  return habits.map<HabitWithLog>(h => ({
    ...h,
    log: logs.find(l => l.habitId === h.id),
  }));
}

export default async function HabitsPage() {
  try {
    const { uid } = await requireActiveSession();
    const habits = await getHabitsToday(uid);
    const today = toDateString(new Date());
    const completed = habits.filter(h => h.log?.completed).length;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Hábitos del día</h1>
            <p className="text-slate-400 text-sm mt-1">{completed} de {habits.length} completados</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{completed === habits.length && habits.length > 0 ? '🎉' : '💪'}</span>
            <AddHabitButton />
          </div>
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
  } catch (error: any) {
    console.error('HABITS PAGE ERROR:', error);
    return (
      <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 space-y-4">
        <h1 className="text-xl font-bold">Error en Página de Hábitos (Debug)</h1>
        <p className="text-sm font-mono break-all">{error.message || 'Error desconocido'}</p>
        <pre className="text-[10px] bg-black/40 p-4 rounded-xl overflow-auto max-h-[300px]">
          {error.stack}
        </pre>
      </div>
    );
  }
}
