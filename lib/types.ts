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

export type NoteCategory = 'prompt' | 'idea' | 'compras' | 'trabajo' | 'personal';

export interface Note {
  id: string;
  title: string;
  content: string;
  category: NoteCategory;
  source: string;       // 'manual' | 'talos'
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
