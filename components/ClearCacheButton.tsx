'use client';

import { useState } from 'react';

export function ClearCacheButton({ mobile = false }: { mobile?: boolean }) {
  const [loading, setLoading] = useState(false);

  const handleClear = async () => {
    setLoading(true);
    try {
      // 1. Borrar todos los caches del SW
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
      }
      // 2. Desregistrar SW para que se reinstale limpio
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map(r => r.unregister()));
      }
    } finally {
      // 3. Hard reload con cache-busting para forzar fetch desde servidor
      window.location.href = window.location.origin + '/?v=' + Date.now();
    }
  };

  if (mobile) {
    return (
      <button
        onClick={handleClear}
        disabled={loading}
        title="Limpiar caché y actualizar"
        className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-500 hover:text-primary-400 hover:border-primary-500/30 transition-all disabled:opacity-40"
      >
        <span className={`material-symbols-outlined text-lg ${loading ? 'animate-spin' : ''}`}>
          refresh
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={handleClear}
      disabled={loading}
      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all disabled:opacity-40"
    >
      <span className={`material-symbols-outlined text-base ${loading ? 'animate-spin' : ''}`}>
        refresh
      </span>
      {loading ? 'Actualizando...' : 'Forzar actualización'}
    </button>
  );
}
