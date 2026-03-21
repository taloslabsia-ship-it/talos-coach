import { NextRequest, NextResponse } from 'next/server';
import { userDb } from '@/lib/firebase';
import { FieldValue } from 'firebase-admin/firestore';
import { toDateString } from '@/lib/utils';

function checkAuth(req: NextRequest) {
  const key = req.headers.get('x-api-key') ?? req.nextUrl.searchParams.get('api_key');
  return key === process.env.TALOS_API_SECRET;
}

function getUid() {
  const uid = process.env.TALOS_USER_UID;
  if (!uid) throw new Error('TALOS_USER_UID no configurado');
  return uid;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const limit = parseInt(req.nextUrl.searchParams.get('limit') ?? '10');

  try {
    const udb = userDb(getUid());
    const snap = await udb.diary().orderBy('date', 'desc').limit(limit).get();
    const entries = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ entries });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });

  const { content, date = toDateString(new Date()) } = body;
  if (!content) return NextResponse.json({ error: 'Se requiere content' }, { status: 400 });

  try {
    const udb = userDb(getUid());
    await udb.diary().doc(date).set({
      content,
      date,
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    return NextResponse.json({ success: true, date });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
