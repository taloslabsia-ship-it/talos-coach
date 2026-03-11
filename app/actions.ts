'use server';

import { db } from '@/lib/firebase';
import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';

export async function toggleHabit(habitId: string, date: string, completed: boolean) {
  const docId = `${habitId}_${date}`;
  await db.collection('habit_logs').doc(docId).set(
    {
      habitId,
      date,
      completed,
      completedAt: completed ? new Date().toISOString() : null,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
  revalidatePath('/');
  revalidatePath('/habits');
}

export async function saveDiaryEntry(date: string, content: string, mood?: string) {
  await db.collection('diary_entries').doc(date).set(
    {
      date,
      content,
      mood: mood ?? null,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
  revalidatePath('/diary');
}

export async function deleteNote(id: string) {
  await db.collection('notes').doc(id).delete();
  revalidatePath('/notes');
}

export async function toggleNoteCompleted(id: string, completed: boolean) {
  await db.collection('notes').doc(id).update({
    completed,
    updatedAt: FieldValue.serverTimestamp(),
  });
  revalidatePath('/notes');
}
