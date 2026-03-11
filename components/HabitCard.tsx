'use client';

import { useState, useTransition } from 'react';
import { cn } from '@/lib/utils';
import type { HabitWithLog } from '@/lib/types';
import { toggleHabit } from '@/app/actions';

interface Props {
  habit: HabitWithLog;
  date: string;
}

export function HabitCard({ habit, date }: Props) {
  const [done, setDone] = useState(habit.log?.completed ?? false);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    const next = !done;
    setDone(next);
    startTransition(async () => {
      await toggleHabit(habit.id, date, next);
    });
  };

  return (
    <div
      className={cn(
        'card flex items-start gap-4 cursor-pointer select-none transition-all',
        done ? 'border-green-800/60 bg-green-950/20' : 'hover:border-slate-700',
        isPending && 'opacity-70'
      )}
      onClick={handleToggle}
    >
      <span className="text-3xl mt-0.5">{habit.emoji}</span>

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className={cn('font-semibold', done ? 'text-green-300 line-through decoration-green-600' : 'text-white')}>
            {habit.name}
          </p>
          {habit.timeLabel && (
            <span className="badge bg-slate-800 text-slate-400">{habit.timeLabel}</span>
          )}
        </div>
        {habit.description && (
          <p className="text-slate-500 text-sm mt-1">{habit.description}</p>
        )}
        {done && habit.log?.completedAt && (
          <p className="text-green-600 text-xs mt-1">
            Completado a las{' '}
            {new Date(habit.log.completedAt).toLocaleTimeString('es-AR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        )}
      </div>

      <button
        className={cn(
          'w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all',
          done
            ? 'border-green-500 bg-green-500'
            : 'border-slate-600 hover:border-brand-400'
        )}
        onClick={(e) => { e.stopPropagation(); handleToggle(); }}
      >
        {done && (
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>
    </div>
  );
}
