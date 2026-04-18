import { NextRequest } from 'next/server';
import { db } from '@/lib/firebase';
import { resolveAuthUid, unauthorized, ok, serverError } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
  const auth = await resolveAuthUid(req);
  if (!auth) return unauthorized();

  try {
    const today = new Date().toISOString().split('T')[0];

    // Hábitos activos
    const habitsSnap = await db.collection('habits').where('active', '==', true).get();
    const totalHabits = habitsSnap.size;

    // Hábitos completados hoy
    const todayLogsSnap = await db
      .collectionGroup('habit_logs')
      .where('date', '==', today)
      .where('completed', '==', true)
      .get();
    const completedToday = todayLogsSnap.size;

    // Total notas
    const notesSnap = await db.collection('notes').get();
    const totalNotes = notesSnap.size;

    // Total entradas diario
    const diarySnap = await db.collectionGroup('diary_entries').get();
    const totalDiary = diarySnap.size;

    return ok({
      completedToday,
      totalHabits,
      totalNotes,
      totalDiary,
      percentage: totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0,
    });
  } catch (e: any) {
    return serverError(e.message);
  }
}
