import { getLast7Days, toDateString } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface Props {
  logs: { date: string; completed: boolean }[];
  totalHabits: number;
}

const DAYS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export function WeekCalendar({ logs, totalHabits }: Props) {
  const days = getLast7Days();
  const today = toDateString(new Date());

  // Contar completados por día
  const countByDate: Record<string, number> = {};
  for (const log of logs) {
    if (log.completed) {
      countByDate[log.date] = (countByDate[log.date] ?? 0) + 1;
    }
  }

  return (
    <div className="card">
      <div className="grid grid-cols-7 gap-2">
        {days.map((dateStr) => {
          const d = new Date(dateStr + 'T00:00:00');
          const dayName = DAYS_ES[d.getDay()];
          const count = countByDate[dateStr] ?? 0;
          const pct = totalHabits > 0 ? count / totalHabits : 0;
          const isToday = dateStr === today;

          const bg =
            pct === 0 ? 'bg-slate-800' :
            pct < 0.5 ? 'bg-brand-800' :
            pct < 1   ? 'bg-brand-600' :
                        'bg-green-500';

          return (
            <div key={dateStr} className="flex flex-col items-center gap-1">
              <span className={cn('text-xs', isToday ? 'text-brand-400 font-bold' : 'text-slate-500')}>
                {dayName}
              </span>
              <div
                className={cn(
                  'w-9 h-9 rounded-xl flex items-center justify-center text-xs font-medium',
                  bg,
                  isToday && 'ring-2 ring-brand-400'
                )}
              >
                {count > 0 ? count : ''}
              </div>
              <span className="text-xs text-slate-600">{d.getDate()}</span>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-4 mt-4 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-slate-800" /> Sin hábitos
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-brand-600" /> Parcial
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-green-500" /> Completo
        </div>
      </div>
    </div>
  );
}
