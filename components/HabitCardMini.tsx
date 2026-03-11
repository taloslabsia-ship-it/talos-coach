import { cn } from '@/lib/utils';
import type { HabitWithLog } from '@/lib/types';

export function HabitCardMini({ habit }: { habit: HabitWithLog }) {
  const done = habit.log?.completed ?? false;

  return (
    <div
      className={cn(
        'flex items-center gap-4 p-4 rounded-2xl border transition-all',
        done
          ? 'border-primary-500/30 bg-primary-500/5'
          : 'border-white/[0.06] bg-white/[0.03] hover:border-primary-500/20'
      )}
    >
      <span className="text-xl">{habit.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className={cn('font-medium text-sm', done ? 'text-primary-300' : 'text-slate-200')}>
          {habit.name}
        </p>
        {habit.timeLabel && (
          <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-widest font-mono">{habit.timeLabel}</p>
        )}
      </div>
      <div
        className={cn(
          'w-6 h-6 rounded-xl border-2 flex items-center justify-center flex-shrink-0 transition-all',
          done ? 'border-primary-500 bg-primary-500 neon-glow-sm' : 'border-slate-600'
        )}
      >
        {done && (
          <svg className="w-3 h-3 text-charcoal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
    </div>
  );
}
