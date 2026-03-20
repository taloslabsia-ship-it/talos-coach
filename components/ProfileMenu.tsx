'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface Props {
  name?: string;
  email?: string;
}

export function ProfileMenu({ name, email }: Props) {
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Cerrar al tocar afuera
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch('/api/auth/session', { method: 'DELETE' });
    router.push('/login');
  };

  const initials = name
    ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : email?.[0]?.toUpperCase() ?? '?';

  return (
    <div ref={menuRef} className="relative">
      {/* Botón — logo / avatar */}
      <button
        onClick={() => setOpen(o => !o)}
        className="relative size-10 flex items-center justify-center rounded-2xl transition-all duration-200 active:scale-95 group"
        style={{ background: open ? 'rgba(13,242,242,0.12)' : 'transparent' }}
        title="Perfil"
      >
        <div className="absolute inset-0 orb-glow opacity-40 rounded-full animate-float group-hover:opacity-70 transition-opacity" />
        <Image
          src="/icon-192.png"
          alt="TALOS"
          width={36}
          height={36}
          className="relative z-10 rounded-xl"
        />
      </button>

      {/* Menú flotante */}
      {open && (
        <div
          className="absolute left-0 top-12 z-50 w-64 rounded-2xl border py-2 shadow-2xl animate-in"
          style={{
            background: 'rgba(10, 20, 20, 0.97)',
            backdropFilter: 'blur(20px)',
            borderColor: 'rgba(13,242,242,0.18)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(13,242,242,0.06)',
          }}
        >
          {/* Info usuario */}
          <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black text-slate-900"
                style={{ background: '#0df2f2', boxShadow: '0 0 10px rgba(13,242,242,0.4)' }}>
                {initials}
              </div>
              <div className="min-w-0">
                {name && <p className="text-white text-sm font-semibold truncate">{name}</p>}
                <p className="text-slate-500 text-xs truncate">{email}</p>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="py-1">
            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-slate-300 hover:text-white hover:bg-white/5 transition-all text-sm"
            >
              <span className="material-symbols-outlined text-base text-slate-500">tune</span>
              Configuración
            </Link>
          </div>

          <div className="border-t py-1" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-all text-sm disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-base">logout</span>
              {loggingOut ? 'Saliendo…' : 'Cerrar sesión'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
