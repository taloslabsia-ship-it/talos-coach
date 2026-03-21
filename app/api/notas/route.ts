import { NextRequest, NextResponse } from 'next/server';
import { userDb } from '@/lib/firebase';
import { FieldValue } from 'firebase-admin/firestore';

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
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });

  const { title, content, category = 'personal' } = body;
  if (!title || !content) return NextResponse.json({ error: 'Se requieren title y content' }, { status: 400 });

  try {
    const udb = userDb(getUid());
    const ref = await udb.notes().add({
      title,
      content,
      category,
      source: 'talos',
      completed: false,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true, id: ref.id }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
