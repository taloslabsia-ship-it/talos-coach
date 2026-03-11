import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { FieldValue } from 'firebase-admin/firestore';
import { toDateString } from '@/lib/utils';

function checkAuth(req: NextRequest) {
  const key = req.headers.get('x-api-key') ?? req.nextUrl.searchParams.get('api_key');
  return key === process.env.TALOS_API_SECRET;
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });

  const { habit_name, habit_id, completed = true, date } = body;
  if (!habit_name && !habit_id) return NextResponse.json({ error: 'Se requiere habit_name o habit_id' }, { status: 400 });

  const targetDate = date ?? toDateString(new Date());
  let resolvedId = habit_id;

  if (!resolvedId) {
    const snap = await db.collection('habits').where('active', '==', true).get();
    const match = snap.docs.find(d =>
      (d.data().name as string).toLowerCase().includes((habit_name as string).toLowerCase())
    );
    if (!match) {
      return NextResponse.json({
        error: `Hábito "${habit_name}" no encontrado`,
        available: snap.docs.map(d => d.data().name),
      }, { status: 404 });
    }
    resolvedId = match.id;
  }

  const docId = `${resolvedId}_${targetDate}`;
  await db.collection('habit_logs').doc(docId).set({
    habitId: resolvedId,
    date: targetDate,
    completed,
    completedAt: completed ? new Date().toISOString() : null,
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true });

  return NextResponse.json({ success: true, habit_id: resolvedId, date: targetDate, completed });
}
