import { NextRequest, NextResponse } from 'next/server';
import { userDb } from '@/lib/firebase';
import { FieldValue } from 'firebase-admin/firestore';

function checkAuth(req: NextRequest) {
  const key = req.headers.get('x-api-key') ?? req.nextUrl.searchParams.get('api_key');
  return key === process.env.TALOS_API_SECRET;
}

const TALOS_USER_UID = process.env.TALOS_USER_UID || 'QXGkRXR6sZYJ5vYopNISy3wiSxN2';

function getUid() {
  return TALOS_USER_UID;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const limit = parseInt(req.nextUrl.searchParams.get('limit') ?? '30');
  const type = req.nextUrl.searchParams.get('type'); // 'morning' | 'evening' | undefined (all)

  try {
    const udb = userDb(getUid());
    let q: any = udb.reflections().orderBy('date', 'desc').limit(limit);

    if (type && (type === 'morning' || type === 'evening')) {
      q = q.where('type', '==', type);
    }

    const snap = await q.get();
    const reflections = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ reflections, total: reflections.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });

  const { date, type, answers } = body;
  if (!date || !type || !Array.isArray(answers)) {
    return NextResponse.json({ error: 'Se requieren date, type, y answers' }, { status: 400 });
  }

  if (!['morning', 'evening'].includes(type)) {
    return NextResponse.json({ error: 'type debe ser "morning" o "evening"' }, { status: 400 });
  }

  try {
    const udb = userDb(getUid());
    const docId = `${date}_${type}`;

    await udb.reflections().doc(docId).set(
      {
        date,
        type,
        answers,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return NextResponse.json({ success: true, id: docId }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
