import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { FieldValue } from 'firebase-admin/firestore';

function checkAuth(req: NextRequest) {
  const key = req.headers.get('x-api-key') ?? req.nextUrl.searchParams.get('api_key');
  return key === process.env.TALOS_API_SECRET;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const category = req.nextUrl.searchParams.get('category');
  const limit = parseInt(req.nextUrl.searchParams.get('limit') ?? '50');

  let q = db.collection('notes').orderBy('createdAt', 'desc').limit(limit);
  if (category && category !== 'all') {
    q = db.collection('notes').where('category', '==', category).orderBy('createdAt', 'desc').limit(limit);
  }

  const snap = await q.get();
  const notes = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  return NextResponse.json({ notes, total: notes.length });
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });

  const { title, content, category = 'personal' } = body;
  if (!title || !content) return NextResponse.json({ error: 'Se requieren title y content' }, { status: 400 });

  const validCategories = ['pendiente', 'prompt', 'idea', 'compras', 'trabajo', 'personal'];
  if (!validCategories.includes(category)) {
    return NextResponse.json({ error: `Categoría inválida. Opciones: ${validCategories.join(', ')}` }, { status: 400 });
  }

  const ref = await db.collection('notes').add({
    title,
    content,
    category,
    source: 'talos',
    completed: false,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({ success: true, id: ref.id }, { status: 201 });
}
