'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
const NAV = [
  { href: '/',          label: 'Inicio',   icon: 'grid_view' },
  { href: '/habits',    label: 'Hábitos',  icon: 'task_alt' },
  { href: '/agenda',    label: 'Agenda',   icon: 'calendar_month' },
  { href: '/diary',     label: 'Diario',   icon: 'edit_note' },
  { href: '/notes',     label: 'Notas',    icon: 'sticky_note_2' },
  { href: '/settings',  label: 'Config',   icon: 'settings' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-2 pb-4 pt-2"
      style={{ background: 'rgba(10, 20, 20, 0.9)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(13,242,242,0.12)' }}
    >
      <div className="flex items-center justify-around">
        {NAV.map(({ href, label, icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-2xl transition-all duration-200 active:scale-[0.88]',
                active ? 'text-primary-500' : 'text-slate-500'
              )}
            >
              {active && (
                <span
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    background: 'rgba(13,242,242,0.1)',
                    boxShadow: '0 0 14px rgba(13,242,242,0.18)',
                    border: '1px solid rgba(13,242,242,0.22)',
                  }}
                />
              )}
              <span
                className={cn(
                  'material-symbols-outlined text-2xl relative z-10 transition-all duration-200',
                  active && 'scale-110 drop-shadow-[0_0_6px_rgba(13,242,242,0.6)]'
                )}
                style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
              >
                {icon}
              </span>
              <span className={cn('text-[9px] font-bold uppercase tracking-tight relative z-10', active ? 'neon-text' : '')}>
                {label}
              </span>
            </Link>
          );
        })}

      </div>
    </nav>
  );
}
