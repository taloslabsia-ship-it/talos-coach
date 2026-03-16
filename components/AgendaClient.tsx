'use client';

import { useState, useTransition } from 'react';
import { cn } from '@/lib/utils';
import { markReminderDone } from '@/app/actions';

interface Reminder {
  id: string;
  text: string;
  date: string;
  time: string;
  status: string;
}

interface Props {
  proximos: Reminder[];
  pasados: Reminder[];
}

function formatDate(date: string) {
  const [y, m, d] = date.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' });
}

function ReminderItem({ reminder }: { reminder: Reminder }) {
  const [done, setDone] = useState(reminder.status === 'done');
  const [isPending, startTransition] = useTransition();

  const handleDone = () => {
    setDone(true);
    startTransition(async () => {
      try {
        await markReminderDone(reminder.id);
      } catch {
        setDone(false);
      }
    });
  };

  const isPast = reminder.date < new Date().toISOString().split('T')[0];

  return (
    <div className={cn(
      'flex items-start gap-4 p-4 rounded-2xl border transition-all',
      done
        ? 'border-white/[0.04] bg-white/[0.02] opacity-60'
        : isPast
          ? 'border-amber-500/20 bg-amber-500/5'
          : 'border-white/[0.06] bg-white/[0.03]'
    )}>
      {/* Indicador estado */}
      <div className={cn(
        'mt-1 w-2.5 h-2.5 rounded-full flex-shrink-0',
        done ? 'bg-slate-600' : isPast ? 'bg-amber-400' : 'bg-primary-400 shadow-[0_0_6px_#0df2f2]'
      )} />

      <div className="flex-1 min-w-0">
        <p className={cn('font-medium text-sm', done ? 'text-slate-500 line-through' : 'text-white')}>
          {reminder.text}
        </p>
        <div className="flex items-center gap-3 mt-1.5">
          <span className="text-xs text-slate-500 font-mono">
            📅 {formatDate(reminder.date)}
          </span>
          <span className="text-xs text-slate-500 font-mono">
            🕐 {reminder.time}
          </span>
        </div>
      </div>

      {!done && (
        <button
          onClick={handleDone}
          disabled={isPending}
          className="flex-shrink-0 text-xs px-3 py-1.5 rounded-xl border border-primary-500/30 text-primary-400 hover:bg-primary-500/10 transition-colors disabled:opacity-40"
        >
          {isPending ? '...' : '✓ Listo'}
        </button>
      )}

      {done && (
        <span className="flex-shrink-0 text-xs text-slate-600 font-mono">✓ hecho</span>
      )}
    </div>
  );
}

export function AgendaClient({ proximos, pasados }: Props) {
  const [tab, setTab] = useState<'proximos' | 'pasados'>('proximos');

  const list = tab === 'proximos' ? proximos : pasados;

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 p-1 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
        {(['proximos', 'pasados'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'flex-1 py-2 rounded-xl text-sm font-semibold transition-all',
              tab === t
                ? 'bg-primary-500/15 text-primary-400 border border-primary-500/25'
                : 'text-slate-500 hover:text-slate-300'
            )}
          >
            {t === 'proximos' ? `Próximos (${proximos.length})` : `Pasados (${pasados.length})`}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="space-y-2">
        {list.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-slate-500 text-sm">
              {tab === 'proximos' ? 'No hay recordatorios pendientes.' : 'Sin recordatorios pasados.'}
            </p>
          </div>
        ) : (
          list.map(r => <ReminderItem key={r.id} reminder={r} />)
        )}
      </div>
    </div>
  );
}
