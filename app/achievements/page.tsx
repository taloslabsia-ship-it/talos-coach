import { db } from '@/lib/firebase';
import { toDateString } from '@/lib/utils';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const BADGES = [
  { days: 7,   emoji: '🥉', label: '7 días',   color: 'border-amber-700/50 bg-amber-950/20',   textColor: 'text-amber-400' },
  { days: 30,  emoji: '🥈', label: '30 días',  color: 'border-slate-500/50 bg-slate-800/50',   textColor: 'text-slate-300' },
  { days: 60,  emoji: '🥇', label: '60 días',  color: 'border-yellow-600/50 bg-yellow-950/20', textColor: 'text-yellow-400' },
  { days: 100, emoji: '👑', label: '100 días', color: 'border-purple-600/50 bg-purple-950/20', textColor: 'text-purple-400' },
];

async function getStreak(): Promise<number> {
  const logsSnap = await db.collection('habit_logs')
    .where('completed', '==', true)
    .orderBy('date', 'desc')
    .limit(300)
    .get();

  if (logsSnap.empty) return 0;

  const dateSet = new Set(logsSnap.docs.map(d => d.data().date as string));
  let streak = 0;
  const today = new Date();

  for (let i = 0; i < 300; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const ds = toDateString(d);
    if (dateSet.has(ds)) streak++;
    else if (i > 0) break;
  }
  return streak;
}

async function getTotalActiveDays(): Promise<number> {
  const logsSnap = await db.collection('habit_logs').where('completed', '==', true).get();
  const uniqueDates = new Set(logsSnap.docs.map(d => d.data().date as string));
  return uniqueDates.size;
}

export default async function AchievementsPage() {
  const [streak, totalDays] = await Promise.all([getStreak(), getTotalActiveDays()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Logros</h1>
        <p className="text-slate-400 text-sm mt-1">
          {totalDays} días activos en total · Racha actual: {streak} días 🔥
        </p>
      </div>

      {(() => {
        const next = BADGES.find(b => streak < b.days);
        if (!next) return null;
        const prev = BADGES[BADGES.indexOf(next) - 1];
        const from = prev?.days ?? 0;
        const pct = Math.round(((streak - from) / (next.days - from)) * 100);
        return (
          <div className="card">
            <p className="text-sm text-slate-400 mb-2">
              Próximo logro: <span className="text-white font-medium">{next.emoji} {next.label}</span>
            </p>
            <div className="w-full bg-slate-800 rounded-full h-2.5">
              <div className="bg-brand-500 h-2.5 rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%` }} />
            </div>
            <p className="text-slate-500 text-xs mt-2">{streak} / {next.days} días ({pct}%)</p>
          </div>
        );
      })()}

      <div className="grid grid-cols-2 gap-4">
        {BADGES.map(badge => {
          const unlocked = streak >= badge.days;
          return (
            <div key={badge.days} className={cn('card flex flex-col items-center py-8 border-2 transition-all', unlocked ? badge.color : 'border-slate-800 opacity-40 grayscale')}>
              <span className={cn('text-6xl mb-3', !unlocked && 'blur-sm')}>{unlocked ? badge.emoji : '🔒'}</span>
              <p className={cn('font-bold text-lg', unlocked ? badge.textColor : 'text-slate-600')}>{badge.label}</p>
              <p className="text-slate-500 text-xs mt-1">{unlocked ? '¡Desbloqueado!' : `Faltan ${badge.days - streak} días`}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-2xl font-bold text-brand-400">{streak}</p>
          <p className="text-slate-500 text-xs mt-1">Racha actual</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-green-400">{totalDays}</p>
          <p className="text-slate-500 text-xs mt-1">Días totales</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-purple-400">{BADGES.filter(b => streak >= b.days).length}</p>
          <p className="text-slate-500 text-xs mt-1">Logros obtenidos</p>
        </div>
      </div>
    </div>
  );
}
