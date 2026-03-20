// Firestore usa camelCase

export interface Habit {
  id: string;
  name: string;
  emoji: string;
  description: string | null;
  timeLabel: string | null;
  sortOrder: number;
  active: boolean;
  createdAt: string;
}

export interface HabitLog {
  id: string;           // doc ID = "{habitId}_{date}"
  habitId: string;
  date: string;         // YYYY-MM-DD
  completed: boolean;
  note: string | null;
  completedAt: string | null;
  createdAt: string;
}

export interface HabitWithLog extends Habit {
  log?: HabitLog;
}

export interface DiaryEntry {
  id: string;           // doc ID = date (YYYY-MM-DD)
  date: string;
  content: string;
  mood: string | null;
  createdAt: string;
  updatedAt: string;
}

export type NoteCategory = 'tarea' | 'nota' | 'idea' | 'pendiente' | 'prompt' | 'compras' | 'trabajo' | 'personal';
export type TaskStatus = 'pendiente' | 'en_progreso' | 'completada';

export interface Note {
  id: string;
  title: string;
  content: string;
  category: NoteCategory;
  source: string;       // 'manual' | 'talos'
  completed?: boolean;
  status?: TaskStatus;  // solo para tareas
  createdAt: string;
  updatedAt: string;
}

export interface MotivationalPhrase {
  id: string;
  phrase: string;
  author: string | null;
  usedOn: string | null;
  createdAt: string;
}

export interface Comercio {
  id: string;
  label: string;
  active: boolean;
}

export type BotPersonality = 'acompanante' | 'equilibrado' | 'entrenador' | 'beast';

export interface UserProfile {
  name: string;
  botPersonality: BotPersonality;
  quietStart: string; // "HH:MM"
  quietEnd: string;   // "HH:MM"
  onboardingDone: boolean;
}

// Stats helpers
export interface DayStats {
  date: string;
  completed: number;
  total: number;
  percentage: number;
}

export interface Achievement {
  id: string;
  label: string;
  emoji: string;
  days: number;
  unlocked: boolean;
  unlockedAt?: string;
}
