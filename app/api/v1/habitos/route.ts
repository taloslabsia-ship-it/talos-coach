import { NextRequest } from 'next/server';
import { db } from '@/lib/firebase';
import { resolveAuthUid, unauthorized, ok, serverError } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
  const auth = await resolveAuthUid(req);
  if (!auth) return unauthorized();

  const date = req.nextUrl.searchParams.get('date') ?? new Date().toISOString().split('T')[0];

  try {
    // Obtener hábitos activos (colección raíz)
    const habitsSnap = await db.collection('habits').where('active', '==', true).get();

    // Obtener logs del usuario para la fecha
    const logsSnap = await db
      .collectionGroup('habit_logs')
      .where('date', '==', date)
      .get();

    const logsByHabitId: Record<string, any> = {};
    logsSnap.docs.forEach(doc => {
      logsByHabitId[doc.data().habitId] = doc.data();
    });

    const items = habitsSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      log: logsByHabitId[doc.id] || null,
    }));

    return ok({ items, total: items.length, date });
  } catch (e: any) {
    return serverError(e.message);
  }
}
