'use client';

import { useState, useTransition, useRef } from 'react';
import { cn } from '@/lib/utils';
import type { HabitWithLog } from '@/lib/types';
import { toggleHabit, deleteHabit } from '@/app/actions';
import { HabitForm } from './HabitForm';

interface Props {
  habit: HabitWithLog;
  date: string;
}

export function HabitCard({ habit, date }: Props) {
  const [done, setDone] = useState(habit.log?.completed ?? false);
  const [isPending, startTransition] = useTransition();
  const [burst, setBurst] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleToggle = () => {
    const next = !done;
    setDone(next);
    if (next) {
      setBurst(true);
      setTimeout(() => setBurst(false), 600);
      import('canvas-confetti').then(({ default: confetti }) => {
        const btn = btnRef.current;
        if (btn) {
          const rect = btn.getBoundingClientRect();
          confetti({
            particleCount: 40,
            spread: 60,
            startVelocity: 20,
            origin: {
              x: (rect.left + rect.width / 2) / window.innerWidth,
              y: (rect.top + rect.height / 2) / window.innerHeight,
            },
            colors: ['#0df2f2', '#a855f7', '#ffffff'],
            scalar: 0.8,
          });
        }
      });
    }
    startTransition(async () => {
      try {
        await toggleHabit(habit.id, date, next);
      } catch {
        setDone(!next); // revertir si falla el server action
      }
    });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`¿Eliminar "${habit.name}"?`)) return;
    startTransition(async () => {
      await deleteHabit(habit.id);
    });
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowEdit(true);
  };

  return (
    <>
      {showEdit && <HabitForm habit={habit} onClose={() => setShowEdit(false)} />}

      <div
        className={cn(
          'relative flex items-start gap-4 p-4 rounded-2xl border cursor-pointer select-none transition-all group',
          done
            ? 'border-primary-500/30 bg-primary-500/5'
            : 'border-white/[0.06] bg-white/[0.03] hover:border-primary-500/20',
          isPending && 'opacity-60'
        )}
        onClick={handleToggle}
      >
        <span className="text-2xl mt-0.5">{habit.emoji}</span>

        <div className="flex-1 min-w-0">
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

        {/* Acciones — visibles en hover (desktop) o siempre en mobile */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 sm:transition-opacity sm:duration-150">
          <button
            onClick={handleEdit}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-primary-400 hover:bg-primary-500/10 transition-colors"
            title="Editar"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Eliminar"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        <button
          ref={btnRef}
          className={cn(
            'w-8 h-8 rounded-xl border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300',
            done ? 'border-primary-500 bg-primary-500 neon-glow-sm' : 'border-slate-600 group-hover:border-primary-500/50',
            burst && 'scale-125'
          )}
          onClick={(e) => { e.stopPropagation(); handleToggle(); }}
        >
          {done && (
            <svg
              className={cn('w-4 h-4 transition-all duration-300', burst ? 'scale-110' : 'scale-100')}
              style={{ color: '#0a1414' }}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
      </div>
    </>
  );
}
