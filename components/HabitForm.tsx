'use client';

import { useState, useTransition, useEffect } from 'react';
import { createHabit, updateHabit } from '@/app/actions';
import type { Habit } from '@/lib/types';

interface Props {
  habit?: Habit;
  onClose: () => void;
}

export function HabitForm({ habit, onClose }: Props) {
  const [name, setName] = useState(habit?.name ?? '');
  const [emoji, setEmoji] = useState(habit?.emoji ?? '✅');
  const [description, setDescription] = useState(habit?.description ?? '');
  const [timeLabel, setTimeLabel] = useState(habit?.timeLabel ?? '');
  const [isPending, startTransition] = useTransition();

  // Cerrar con Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        if (habit) {
          await updateHabit(habit.id, name, emoji, description || null, timeLabel || null);
        } else {
          await createHabit(name, emoji, description || null, timeLabel || null);
        }
        onClose();
      } catch {
        // silencioso — el form sigue abierto si falla
      }
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl border border-primary-500/20 bg-[#0f1e1e] p-6 space-y-5 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-white">
          {habit ? 'Editar hábito' : 'Nuevo hábito'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Emoji + Nombre */}
          <div className="flex gap-3">
            <input
              value={emoji}
              onChange={e => setEmoji(e.target.value)}
              className="input-dark w-16 text-center text-2xl"
              maxLength={2}
              aria-label="Emoji"
            />
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Nombre del hábito"
              className="input-dark flex-1"
              required
              autoFocus
            />
          </div>

          {/* Descripción */}
          <input
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Descripción (opcional)"
            className="input-dark"
          />

          {/* Horario */}
          <input
            value={timeLabel}
            onChange={e => setTimeLabel(e.target.value)}
            placeholder="Horario (ej: 6:00 AM)"
            className="input-dark"
          />

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending || !name.trim()}
              className="btn-primary flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isPending ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
