import { NextRequest } from 'next/server';
import { userDb } from '@/lib/firebase';
import { FieldValue } from 'firebase-admin/firestore';
import { resolveAuthUid, unauthorized, badRequest, ok, created, serverError } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
  const auth = await resolveAuthUid(req);
  if (!auth) return unauthorized();

  const category = req.nextUrl.searchParams.get('category');
  const limit = Math.min(parseInt(req.nextUrl.searchParams.get('limit') ?? '50'), 200);

  try {
    const udb = userDb(auth.uid);
    const base = udb.notes();
    const q = category && category !== 'all'
      ? base.where('category', '==', category).orderBy('createdAt', 'desc').limit(limit)
      : base.orderBy('createdAt', 'desc').limit(limit);

    const snap = await q.get();
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return ok({ items, total: items.length });
  } catch (e: any) {
    return serverError(e.message);
  }
}

export async function POST(req: NextRequest) {
  const auth = await resolveAuthUid(req);
  if (!auth) return unauthorized();

  const body = await req.json().catch(() => null);
  if (!body) return badRequest('Invalid JSON');

  const { title, content, category = 'nota' } = body;
  if (!title) return badRequest('Se requiere title');

  try {
    const udb = userDb(auth.uid);
    const ref = await udb.notes().add({
      title,
      content: content || '',
      category,
      source: auth.isApiKey ? 'talos_api' : 'manual',
      completed: false,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return created({ id: ref.id });
  } catch (e: any) {
    return serverError(e.message);
  }
}
