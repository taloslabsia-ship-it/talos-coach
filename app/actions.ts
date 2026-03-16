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

export async function deleteDiaryEntry(id: string) {
  await db.collection('diary_entries').doc(id).delete();
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

export async function createHabit(name: string, emoji: string, description: string | null, timeLabel: string | null) {
  const snap = await db.collection('habits').orderBy('sortOrder', 'desc').limit(1).get();
  const maxOrder = snap.empty ? 0 : ((snap.docs[0].data().sortOrder as number) ?? 0);
  await db.collection('habits').add({
    name, emoji, description, timeLabel,
    sortOrder: maxOrder + 1,
    active: true,
    createdAt: FieldValue.serverTimestamp(),
  });
  revalidatePath('/habits');
  revalidatePath('/');
}

export async function updateHabit(id: string, name: string, emoji: string, description: string | null, timeLabel: string | null) {
  await db.collection('habits').doc(id).update({ name, emoji, description, timeLabel });
  revalidatePath('/habits');
  revalidatePath('/');
}

export async function deleteHabit(id: string) {
  await db.collection('habits').doc(id).delete();
  revalidatePath('/habits');
  revalidatePath('/');
}

export async function markReminderDone(id: string) {
  await db.collection('reminders').doc(id).update({ status: 'done' });
  revalidatePath('/agenda');
}
