import { NextRequest, NextResponse } from 'next/server';
import { userDb } from '@/lib/firebase';
import { FieldValue } from 'firebase-admin/firestore';
import { getSessionUser } from '@/lib/session';

function checkAuth(req: NextRequest) {
  const key = req.headers.get('x-api-key') ?? req.nextUrl.searchParams.get('api_key');
  return key === process.env.TALOS_API_SECRET;
}

const TALOS_USER_UID = process.env.TALOS_USER_UID || 'QXGkRXR6sZYJSvYopNISy3wiSxN2';

function getUid() {
  return TALOS_USER_UID;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const category = req.nextUrl.searchParams.get('category');
  const limit = parseInt(req.nextUrl.searchParams.get('limit') ?? '50');

  try {
    const udb = userDb(getUid());
    const base = udb.notes();
    const q = category && category !== 'all'
      ? base.where('category', '==', category).orderBy('createdAt', 'desc').limit(limit)
      : base.orderBy('createdAt', 'desc').limit(limit);

    const snap = await q.get();
    const notes = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ notes, total: notes.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // Aceptar: API key O sesión autenticada
  const hasApiKey = checkAuth(req);
  let uid = getUid();

  if (!hasApiKey) {
    try {
      const user = await getSessionUser();
      if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      uid = user.uid;
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });

  const { title, content, category = 'nota' } = body;
  if (!title) return NextResponse.json({ error: 'Se requiere title' }, { status: 400 });

  try {
    const udb = userDb(uid);
    const ref = await udb.notes().add({
      title,
      content: content || '',
      category,
      source: 'manual',
      completed: false,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true, id: ref.id }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
