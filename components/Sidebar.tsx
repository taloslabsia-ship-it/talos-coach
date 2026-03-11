'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/',             label: 'Inicio',       icon: 'grid_view' },
  { href: '/habits',       label: 'Hábitos',      icon: 'task_alt' },
  { href: '/diary',        label: 'Diario',        icon: 'edit_note' },
  { href: '/stats',        label: 'Estadísticas', icon: 'monitoring' },
  { href: '/achievements', label: 'Logros',        icon: 'emoji_events' },
  { href: '/notes',        label: 'Notas',         icon: 'sticky_note_2' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-[220px] shrink-0 flex-col py-6 px-3 border-r"
      style={{
        background: 'rgba(10, 20, 20, 0.95)',
        backdropFilter: 'blur(12px)',
        borderColor: 'rgba(13, 242, 242, 0.12)',
      }}
    >
      {/* Logo */}
      <div className="px-3 mb-8">
        <div className="flex items-center gap-3">
          <div className="relative size-9 flex items-center justify-center">
            <div className="absolute inset-0 orb-glow opacity-60 rounded-full" />
            <span className="material-symbols-outlined text-primary-500 text-2xl relative z-10" style={{ fontVariationSettings: "'FILL' 1" }}>
              radio_button_checked
            </span>
          </div>
          <div>
            <p className="text-white font-black text-sm leading-none tracking-tight">TALOS</p>
            <p className="text-primary-500/60 text-[10px] mt-0.5 uppercase tracking-widest font-semibold">Asistente</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {NAV.map(({ href, label, icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all',
                active
                  ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20 neon-glow-sm'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
              )}
            >
              <span
                className={cn('material-symbols-outlined text-xl', active && 'text-primary-400')}
                style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
              >
                {icon}
              </span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pt-4 border-t" style={{ borderColor: 'rgba(13, 242, 242, 0.1)' }}>
        <p className="text-[10px] text-primary-500/40 text-center uppercase tracking-widest font-semibold">
          Powered by TALOS AI
        </p>
      </div>
    </aside>
  );
}
