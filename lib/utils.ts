import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

const TZ = 'America/Argentina/Buenos_Aires';

export function formatDate(date: Date | string): string {
  // Append T12:00:00 so Node treats it as local noon (UTC), avoiding midnight-UTC → prev-day-ART conversion
  const d = typeof date === 'string' ? new Date(date + 'T12:00:00') : date;
  return d.toLocaleDateString('es-AR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: TZ,
  });
}

export function toDateString(date: Date): string {
  // Use Argentina timezone so date matches local day, not UTC
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
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
  tarea:     'bg-primary-500/10 text-primary-400 border border-primary-500/20',
  nota:      'bg-slate-500/10 text-slate-400 border border-slate-500/20',
  idea:      'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  // legacy
  pendiente: 'bg-primary-500/10 text-primary-400 border border-primary-500/20',
  prompt:    'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  compras:   'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  trabajo:   'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  personal:  'bg-slate-500/10 text-slate-400 border border-slate-500/20',
};

export const CATEGORY_LABELS: Record<string, string> = {
  tarea:     'Tarea',
  nota:      'Nota',
  idea:      'Idea',
  // legacy
  pendiente: 'Tarea',
  prompt:    'Prompt',
  idea_old:  'Idea',
  compras:   'Compras',
  trabajo:   'Trabajo',
  personal:  'Nota',
};

export const CATEGORY_ICONS: Record<string, string> = {
  tarea:     'checklist',
  nota:      'sticky_note_2',
  idea:      'lightbulb',
  pendiente: 'checklist',
  prompt:    'article',
  compras:   'shopping_cart',
  trabajo:   'work',
  personal:  'person',
};

export const STATUS_LABELS: Record<string, string> = {
  pendiente:   'Pendiente',
  en_progreso: 'En progreso',
  completada:  'Completada',
};

export const STATUS_COLORS: Record<string, string> = {
  pendiente:   'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  en_progreso: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  completada:  'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
};

// Maps a category to the 3 main tabs
export function getTab(category: string): 'tareas' | 'notas' | 'ideas' {
  if (category === 'tarea' || category === 'pendiente') return 'tareas';
  if (category === 'idea') return 'ideas';
  return 'notas';
}
