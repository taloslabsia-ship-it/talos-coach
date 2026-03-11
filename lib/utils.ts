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
  prompt:   'bg-purple-100 text-purple-700',
  idea:     'bg-yellow-100 text-yellow-700',
  compras:  'bg-green-100 text-green-700',
  trabajo:  'bg-blue-100 text-blue-700',
  personal: 'bg-pink-100 text-pink-700',
};

export const CATEGORY_LABELS: Record<string, string> = {
  prompt:   'Prompt',
  idea:     'Idea',
  compras:  'Compras',
  trabajo:  'Trabajo',
  personal: 'Personal',
};
