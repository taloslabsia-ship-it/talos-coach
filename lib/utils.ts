import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-AR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getLast7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return toDateString(d);
  });
}

export function getLast30Days(): string[] {
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return toDateString(d);
  });
}

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export const CATEGORY_COLORS: Record<string, string> = {
  pendiente: 'bg-primary-500/10 text-primary-400 border border-primary-500/20',
  prompt:    'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  idea:      'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  compras:   'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  trabajo:   'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  personal:  'bg-pink-500/10 text-pink-400 border border-pink-500/20',
};

export const CATEGORY_LABELS: Record<string, string> = {
  pendiente: '✅ Pendientes',
  prompt:    '📋 Prompts',
  idea:      '💡 Ideas',
  compras:   '🛒 Compras',
  trabajo:   '💼 Trabajo',
  personal:  '👤 Personal',
};

export const CATEGORY_ICONS: Record<string, string> = {
  pendiente: '✅',
  prompt:    '📋',
  idea:      '💡',
  compras:   '🛒',
  trabajo:   '💼',
  personal:  '👤',
};
