import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });

  const { date, content } = body;
  if (!date || !content) return NextResponse.json({ error: 'Se requieren date y content' }, { status: 400 });

  await db.collection('diary_entries').doc(date).set(
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
