export function StreakCard({ streak }: { streak: number }) {
  return (
    <div className="card flex flex-col items-center justify-center text-center">
      <span className="text-5xl mb-2">🔥</span>
      <p className="text-4xl font-bold text-white">{streak}</p>
      <p className="text-slate-400 text-sm mt-1">
        {streak === 1 ? 'día de racha' : 'días de racha'}
      </p>
      {streak >= 7 && (
        <span className="badge bg-orange-500/20 text-orange-300 mt-2">
          ¡En llamas!
        </span>
      )}
    </div>
  );
}
