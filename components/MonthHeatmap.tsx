'use client';

import { cn } from '@/lib/utils';
import type { DayStats } from '@/lib/types';

const DAYS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export function MonthHeatmap({ data }: { data: DayStats[] }) {
  const getColor = (pct: number) => {
    if (pct === 0)    return 'bg-slate-800';
    if (pct < 40)     return 'bg-brand-900';
    if (pct < 70)     return 'bg-brand-700';
    if (pct < 100)    return 'bg-brand-500';
    return 'bg-green-500';
  };

  return (
    <div className="overflow-x-auto">
      <div className="flex flex-wrap gap-1.5">
        {data.map((d) => {
          const date = new Date(d.date + 'T00:00:00');
          const dayName = DAYS_ES[date.getDay()];
          const label = `${dayName} ${date.getDate()}/${date.getMonth() + 1} — ${d.percentage}%`;

          return (
            <div
              key={d.date}
              title={label}
              className={cn(
                'w-7 h-7 rounded-md cursor-pointer transition-transform hover:scale-110',
                getColor(d.percentage)
              )}
            />
          );
        })}
      </div>
      <div className="flex items-center gap-3 mt-3 text-xs text-slate-600">
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-slate-800" /> 0%</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-brand-700" /> 40%+</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-brand-500" /> 70%+</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-green-500" /> 100%</div>
      </div>
    </div>
  );
}
