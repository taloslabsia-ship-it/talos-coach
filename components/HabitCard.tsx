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
        'flex items-start gap-4 p-4 rounded-2xl border cursor-pointer select-none transition-all group',
        done
          ? 'border-primary-500/30 bg-primary-500/5'
          : 'border-white/[0.06] bg-white/[0.03] hover:border-primary-500/20',
        isPending && 'opacity-60'
      )}
      onClick={handleToggle}
    >
      <span className="text-2xl mt-0.5">{habit.emoji}</span>

      <div className="flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className={cn('font-semibold', done ? 'text-primary-400 line-through decoration-primary-600' : 'text-white')}>
            {habit.name}
          </p>
          {habit.timeLabel && (
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{habit.timeLabel}</span>
          )}
        </div>
        {habit.description && (
          <p className="text-slate-500 text-sm mt-1">{habit.description}</p>
        )}
        {done && habit.log?.completedAt && (
          <p className="text-xs mt-1 font-mono" style={{ color: '#0df2f2', opacity: 0.7 }}>
            ✓ {new Date(habit.log.completedAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>

      <button
        className={cn(
          'w-8 h-8 rounded-xl border-2 flex items-center justify-center flex-shrink-0 transition-all',
          done ? 'border-primary-500 bg-primary-500 neon-glow-sm' : 'border-slate-600 group-hover:border-primary-500/50'
        )}
        onClick={(e) => { e.stopPropagation(); handleToggle(); }}
      >
        {done && (
          <svg className="w-4 h-4" style={{ color: '#0a1414' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>
    </div>
  );
}
