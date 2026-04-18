'use server';

import { db, userDb } from '@/lib/firebase';
import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';
import { requireSession } from '@/lib/session';
import type { UserProfile, Comercio } from '@/lib/types';

// ── Perfil ────────────────────────────────────────────────────────────────────

export async function getUserProfile(): Promise<UserProfile | null> {
  const { uid } = await requireSession();
  const udb = userDb(uid);
  const doc = await udb.config('profile').get();
  if (!doc.exists) return null;
  const d = doc.data()!;
  return {
    name: d.name ?? '',
    botPersonality: d.botPersonality ?? 'equilibrado',
    quietStart: d.quietStart ?? '22:00',
    quietEnd: d.quietEnd ?? '08:00',
    onboardingDone: d.onboardingDone ?? false,
  };
}

export async function saveUserProfile(profile: Partial<UserProfile>) {
  const { uid } = await requireSession();
  const udb = userDb(uid);
  await udb.config('profile').set(
    { ...profile, updatedAt: FieldValue.serverTimestamp() },
    { merge: true }
  );
  revalidatePath('/settings');
  revalidatePath('/');
}

// ── Integraciones ─────────────────────────────────────────────────────────────

export async function getIntegrationsStatus() {
  const { uid } = await requireSession();
  const udb = userDb(uid);

  const [calendarDoc, comerciosDoc] = await Promise.all([
    udb.config('google_oauth').get(),
    udb.config('ventas_comercios').get(),
  ]);

  const calendarConnected = calendarDoc.exists && !!calendarDoc.data()?.refresh_token;

  const defaultComercios: Comercio[] = [
    { id: 'qcqXIFsZeHPpN29BeHIW2T8LUh92', label: 'Vinoteca Talos', active: true },
    { id: 'N52iXyvZkvPbTVWYR87jP0bgID92', label: 'Central Comercio', active: true },
  ];
  const comercios: Comercio[] = comerciosDoc.exists
    ? (comerciosDoc.data()?.comercios ?? defaultComercios)
    : defaultComercios;

  return { calendarConnected, comercios };
}

export async function saveComercios(comercios: Comercio[]) {
  const { uid } = await requireSession();
  const udb = userDb(uid);
  await udb.config('ventas_comercios').set(
    { comercios, updatedAt: FieldValue.serverTimestamp() },
    { merge: true }
  );
  revalidatePath('/settings');
}

// ── ElevenLabs ────────────────────────────────────────────────────────────────

export async function getElevenLabsConfig(): Promise<{ apiKey: string; voiceId: string } | null> {
  const { uid } = await requireSession();
  const udb = userDb(uid);
  const doc = await udb.config('elevenlabs').get();
  if (!doc.exists) return null;
  return {
    apiKey: doc.data()?.apiKey ?? '',
    voiceId: doc.data()?.voiceId ?? '',
  };
}

export async function saveElevenLabsConfig(apiKey: string, voiceId: string) {
  const { uid } = await requireSession();
  const udb = userDb(uid);
  await udb.config('elevenlabs').set(
    { apiKey, voiceId, updatedAt: FieldValue.serverTimestamp() },
    { merge: true }
  );
  revalidatePath('/configuracion');
}

// ── Hábitos ───────────────────────────────────────────────────────────────────

export async function toggleHabit(habitId: string, date: string, completed: boolean) {
  const { uid } = await requireSession();
  const udb = userDb(uid);
  const docId = `${habitId}_${date}`;
  await udb.habitLogs().doc(docId).set(
    {
      habitId, date, completed,
      completedAt: completed ? new Date().toISOString() : null,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
  revalidatePath('/');
  revalidatePath('/habits');
}

export async function createHabit(name: string, emoji: string, description: string | null, timeLabel: string | null) {
  const { uid } = await requireSession();
  const udb = userDb(uid);
  const snap = await udb.habits().orderBy('sortOrder', 'desc').limit(1).get();
  const maxOrder = snap.empty ? 0 : ((snap.docs[0].data().sortOrder as number) ?? 0);
  await udb.habits().add({
    name, emoji, description, timeLabel,
    sortOrder: maxOrder + 1,
    active: true,
    createdAt: FieldValue.serverTimestamp(),
  });
  revalidatePath('/habits');
  revalidatePath('/');
}

export async function updateHabit(id: string, name: string, emoji: string, description: string | null, timeLabel: string | null) {
  const { uid } = await requireSession();
  const udb = userDb(uid);
  await udb.habits().doc(id).update({ name, emoji, description, timeLabel });
  revalidatePath('/habits');
  revalidatePath('/');
}

export async function deleteHabit(id: string) {
  const { uid } = await requireSession();
  const udb = userDb(uid);
  await udb.habits().doc(id).delete();
  revalidatePath('/habits');
  revalidatePath('/');
}

// ── Diario ────────────────────────────────────────────────────────────────────

export async function saveDiaryEntry(date: string, content: string, mood?: string) {
  const { uid } = await requireSession();
  const udb = userDb(uid);
  await udb.diary().doc(date).set(
    { date, content, mood: mood ?? null, updatedAt: FieldValue.serverTimestamp() },
    { merge: true }
  );
  revalidatePath('/diary');
}

export async function deleteDiaryEntry(id: string) {
  const { uid } = await requireSession();
  const udb = userDb(uid);
  await udb.diary().doc(id).delete();
  revalidatePath('/diary');
}

// ── Notas ─────────────────────────────────────────────────────────────────────

export async function deleteNote(id: string) {
  const { uid } = await requireSession();
  const udb = userDb(uid);
  await udb.notes().doc(id).delete();
  revalidatePath('/notes');
}

export async function toggleNoteCompleted(id: string, completed: boolean) {
  const { uid } = await requireSession();
  const udb = userDb(uid);
  await udb.notes().doc(id).update({ completed, updatedAt: FieldValue.serverTimestamp() });
  revalidatePath('/notes');
}

export async function updateNoteStatus(id: string, status: 'pendiente' | 'en_progreso' | 'completada') {
  const { uid } = await requireSession();
  const udb = userDb(uid);
  await udb.notes().doc(id).update({
    status,
    completed: status === 'completada',
    updatedAt: FieldValue.serverTimestamp(),
  });
  revalidatePath('/notes');
}

export async function updateNote(id: string, data: { title: string; content: string; category: string }) {
  const { uid } = await requireSession();
  const udb = userDb(uid);
  await udb.notes().doc(id).update({
    title: data.title,
    content: data.content,
    category: data.category,
    updatedAt: FieldValue.serverTimestamp(),
  });
  revalidatePath('/notes');
}

// ── Agenda ────────────────────────────────────────────────────────────────────

export async function markReminderDone(id: string) {
  const { uid } = await requireSession();
  const udb = userDb(uid);
  await udb.reminders().doc(id).update({ status: 'done' });
  revalidatePath('/agenda');
}
