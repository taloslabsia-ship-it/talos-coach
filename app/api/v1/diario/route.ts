import { NextRequest } from 'next/server';
import { userDb } from '@/lib/firebase';
import { FieldValue } from 'firebase-admin/firestore';
import { resolveAuthUid, unauthorized, badRequest, ok, serverError } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
  const auth = await resolveAuthUid(req);
  if (!auth) return unauthorized();

  const limit = Math.min(parseInt(req.nextUrl.searchParams.get('limit') ?? '30'), 200);
  const from = req.nextUrl.searchParams.get('from');
  const to = req.nextUrl.searchParams.get('to');

  try {
    const udb = userDb(auth.uid);
    let q = udb.diary().orderBy('date', 'desc').limit(limit);

    if (from || to) {
      if (from) q = q.where('date', '>=', from);
      if (to) q = q.where('date', '<=', to);
    }

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

  const { content, date, mood } = body;
  if (!content) return badRequest('Se requiere content');

  const entryDate = date ?? new Date().toISOString().split('T')[0];

  try {
    const udb = userDb(auth.uid);
    await udb.diary().doc(entryDate).set(
      {
        date: entryDate,
        content,
        mood: mood ?? null,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return ok({ id: entryDate, date: entryDate });
  } catch (e: any) {
    return serverError(e.message);
  }
}
