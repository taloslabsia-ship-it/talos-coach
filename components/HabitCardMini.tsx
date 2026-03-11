import { cn } from '@/lib/utils';
import type { HabitWithLog } from '@/lib/types';

export function HabitCardMini({ habit }: { habit: HabitWithLog }) {
  const done = habit.log?.completed ?? false;

  return (
    <div
      className={cn(
        'card-sm flex items-center gap-4 transition-colors',
        done ? 'border-green-800/60 bg-green-950/30' : 'border-slate-800'
      )}
    >
      <span className="text-2xl">{habit.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className={cn('font-medium text-sm', done ? 'text-green-300' : 'text-white')}>
          {habit.name}
        </p>
        {habit.timeLabel && (
          <p className="text-xs text-slate-500 mt-0.5">{habit.timeLabel}</p>
        )}
      </div>
      <div
        className={cn(
          'w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0',
          done ? 'border-green-500 bg-green-500' : 'border-slate-600'
        )}
      >
        {done && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
    </div>
  );
}
