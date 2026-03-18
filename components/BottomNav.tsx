'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/',       label: 'Inicio',  icon: 'grid_view' },
  { href: '/habits', label: 'Hábitos', icon: 'task_alt' },
  { href: '/agenda', label: 'Agenda',  icon: 'calendar_month' },
  { href: '/diary',  label: 'Diario',  icon: 'edit_note' },
  { href: '/stats',  label: 'Stats',   icon: 'monitoring' },
  { href: '/notes',  label: 'Notas',   icon: 'sticky_note_2' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-2 pb-4 pt-2"
      style={{ background: 'rgba(10, 20, 20, 0.85)', backdropFilter: 'blur(16px)', borderTop: '1px solid rgba(13,242,242,0.12)' }}
    >
      <div className="flex items-center justify-around">
        {NAV.map(({ href, label, icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-2 py-2 rounded-2xl transition-all',
                active ? 'text-primary-500' : 'text-slate-500 hover:text-slate-300'
              )}
            >
              <span
                className="material-symbols-outlined text-2xl"
                style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
              >
                {icon}
              </span>
              <span className={cn('text-[9px] font-bold uppercase tracking-tight', active && 'neon-text')}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
