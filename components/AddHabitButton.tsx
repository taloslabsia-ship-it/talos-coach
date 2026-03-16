'use client';

import { useState } from 'react';
import { HabitForm } from './HabitForm';

export function AddHabitButton() {
  const [show, setShow] = useState(false);

  return (
    <>
      {show && <HabitForm onClose={() => setShow(false)} />}
      <button
        onClick={() => setShow(true)}
        className="btn-primary flex items-center gap-2 text-sm"
      >
        <span className="text-lg leading-none">+</span>
        Hábito
      </button>
    </>
  );
}
