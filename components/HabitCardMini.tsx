'use client';

import { useState, useTransition, useEffect } from 'react';
import { cn, toDateString } from '@/lib/utils';
import type { HabitWithLog } from '@/lib/types';
import { toggleHabit } from '@/app/actions';

export function HabitCardMini({ habit }: { habit: HabitWithLog }) {
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(habit.log?.completed ?? false);
  const [justCompleted, setJustCompleted] = useState(false);

  // Sincronizar estado local si las props cambian (ej: revalidatePath)
  useEffect(() => {
    setDone(habit.log?.completed ?? false);
  }, [habit.log?.completed]);

  const handleToggle = () => {
    const next = !done;
    setDone(next);
    if (next) setJustCompleted(true);

    startTransition(async () => {
      const today = toDateString(new Date());
      try {
        await toggleHabit(habit.id, today, next);
      } catch (error) {
        setDone(!next);
        console.error('Error toggling habit:', error);
      }
    });

    if (next) setTimeout(() => setJustCompleted(false), 600);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={cn(
        'w-full text-left flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 cursor-pointer active:scale-[0.97] outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
        isPending && 'opacity-60',
        done
          ? 'border-primary-500/30 bg-primary-500/5 shadow-[0_0_14px_rgba(13,242,242,0.07)]'
          : 'border-white/[0.06] bg-white/[0.03] hover:border-primary-500/20 hover:bg-primary-500/[0.03]'
      )}
    >
      <span className={cn(
        'text-xl shrink-0 transition-transform duration-300',
        justCompleted && 'animate-pop'
      )}>
        {habit.emoji}
      </span>
      <div className="flex-1 min-w-0">
        <p className={cn('font-medium text-sm truncate transition-colors duration-200', done ? 'text-primary-300' : 'text-slate-200')}>
          {habit.name}
        </p>
        {habit.timeLabel && (
          <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-widest font-mono shrink-0">{habit.timeLabel}</p>
        )}
      </div>
      <div
        className={cn(
          'w-6 h-6 rounded-xl border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200',
          done ? 'border-primary-500 bg-primary-500 neon-glow-sm' : 'border-slate-600'
        )}
      >
        {done && (
          <svg
            className={cn('w-3 h-3 text-slate-900', justCompleted && 'animate-pop')}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
    </button>
  );
}
