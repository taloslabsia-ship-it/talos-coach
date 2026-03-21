import { NextRequest, NextResponse } from 'next/server';
import { userDb } from '@/lib/firebase';
import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';
import { getSessionUser } from '@/lib/session';

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });

  const { date, content } = body;
  if (!date || !content) return NextResponse.json({ error: 'Se requieren date y content' }, { status: 400 });

  const udb = userDb(user.uid);
  await udb.diary().doc(date).set(
    {
      date,
      content,
      mood: body.mood ?? null,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  revalidatePath('/diary');
  return NextResponse.json({ success: true });
}
