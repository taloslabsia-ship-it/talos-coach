export function StreakCard({ streak }: { streak: number }) {
  return (
    <div className="card flex flex-col items-center justify-center text-center relative overflow-hidden">
      <div className="absolute inset-0 orb-glow opacity-20 rounded-full scale-50" />
      <span className="material-symbols-outlined text-5xl mb-1 relative z-10"
        style={{ color: '#0df2f2', fontVariationSettings: "'FILL' 1", textShadow: '0 0 20px rgba(13,242,242,0.5)' }}>
        local_fire_department
      </span>
      <p className="text-4xl font-black text-white relative z-10">{streak}</p>
      <p className="text-slate-400 text-xs mt-1 uppercase tracking-widest relative z-10">
        {streak === 1 ? 'día de racha' : 'días de racha'}
      </p>
      {streak >= 7 && (
        <span className="badge mt-2 relative z-10" style={{ background: 'rgba(13,242,242,0.1)', color: '#0df2f2' }}>
          ¡En llamas!
        </span>
      )}
    </div>
  );
}
