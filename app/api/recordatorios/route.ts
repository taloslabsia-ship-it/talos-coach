import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { FieldValue } from 'firebase-admin/firestore';

function checkAuth(req: NextRequest) {
  const key = req.headers.get('x-api-key') ?? req.nextUrl.searchParams.get('api_key');
  return key === process.env.TALOS_API_SECRET;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const snap = await db.collection('reminders')
      .where('status', '==', 'pending')
      .orderBy('date', 'asc')
      .orderBy('time', 'asc')
      .get();

    const reminders = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ reminders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });

  const { text, time, date } = body;
  if (!text || !time) return NextResponse.json({ error: 'Se requieren text y time' }, { status: 400 });

  try {
    // We'll store this in the 'reminders' collection, which the bot also uses.
    const ref = await db.collection('reminders').add({
      text,
      time,
      date: date ?? new Date().toISOString().split('T')[0],
      status: 'pending',
      userId: '1', // Hardcoded for now as per current app context
      createdAt: FieldValue.serverTimestamp(),
      source: 'talos_api',
    });

    return NextResponse.json({ success: true, id: ref.id }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
