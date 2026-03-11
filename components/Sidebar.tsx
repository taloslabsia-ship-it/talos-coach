'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/',             label: 'Inicio',       emoji: '🏠' },
  { href: '/habits',       label: 'Hábitos',      emoji: '✅' },
  { href: '/diary',        label: 'Diario',        emoji: '📓' },
  { href: '/stats',        label: 'Estadísticas', emoji: '📊' },
  { href: '/achievements', label: 'Logros',        emoji: '🏆' },
  { href: '/notes',        label: 'Notas',         emoji: '📌' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[220px] shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col py-6 px-3">
      {/* Logo */}
      <div className="px-3 mb-8">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⚡</span>
          <div>
            <p className="text-white font-bold text-sm leading-none">TALOS</p>
            <p className="text-slate-500 text-xs mt-0.5">Asistente</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {NAV.map(({ href, label, emoji }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                active
                  ? 'bg-brand-500/20 text-brand-300'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
              )}
            >
              <span className="text-base">{emoji}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pt-4 border-t border-slate-800">
        <p className="text-xs text-slate-600 text-center">
          Powered by TALOS AI
        </p>
      </div>
    </aside>
  );
}
