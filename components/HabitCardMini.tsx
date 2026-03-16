'use client';

import { useState, useTransition, useEffect } from 'react';
import { cn, toDateString } from '@/lib/utils';
import type { HabitWithLog } from '@/lib/types';
import { toggleHabit } from '@/app/actions';

export function HabitCardMini({ habit }: { habit: HabitWithLog }) {
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(habit.log?.completed ?? false);

  // Sincronizar estado local si las props cambian (ej: revalidatePath)
  useEffect(() => {
    setDone(habit.log?.completed ?? false);
  }, [habit.log?.completed]);

  const handleToggle = () => {
    console.log('Toggling habit:', habit.name, 'current:', done);
    const next = !done;
    setDone(next); // Cambio inmediato en UI

    startTransition(async () => {
      const today = toDateString(new Date());
      try {
        await toggleHabit(habit.id, today, next);
        console.log('Toggle success:', habit.name);
      } catch (error) {
        setDone(!next); // Revertir si falla
        console.error('Error toggling habit:', error);
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={cn(
        'w-full text-left flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
        isPending && 'opacity-70',
        done
          ? 'border-primary-500/30 bg-primary-500/5'
          : 'border-white/[0.06] bg-white/[0.03] hover:border-primary-500/20'
      )}
    >
      <span className="text-xl shrink-0">{habit.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className={cn('font-medium text-sm truncate', done ? 'text-primary-300' : 'text-slate-200')}>
          {habit.name}
        </p>
        {habit.timeLabel && (
          <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-widest font-mono shrink-0">{habit.timeLabel}</p>
        )}
      </div>
      <div
        className={cn(
          'w-6 h-6 rounded-xl border-2 flex items-center justify-center flex-shrink-0 transition-all',
          done ? 'border-primary-500 bg-primary-500 neon-glow-sm' : 'border-slate-600'
        )}
      >
        {done && (
          <svg className="w-3 h-3 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
    </button>
  );
}
