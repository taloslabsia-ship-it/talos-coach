import { NextRequest } from 'next/server';
import { userDb } from '@/lib/firebase';
import { FieldValue } from 'firebase-admin/firestore';
import { resolveAuthUid, unauthorized, badRequest, ok, created, serverError } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
  const auth = await resolveAuthUid(req);
  if (!auth) return unauthorized();

  const type = req.nextUrl.searchParams.get('type');
  const limit = Math.min(parseInt(req.nextUrl.searchParams.get('limit') ?? '30'), 200);

  try {
    const udb = userDb(auth.uid);
    let q = udb.reflections().orderBy('date', 'desc').limit(limit);

    if (type && (type === 'morning' || type === 'evening')) {
      q = q.where('type', '==', type);
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

  const { date, type, answers } = body;

  if (!date) return badRequest('Se requiere date');
  if (!type) return badRequest('Se requiere type (morning|evening)');
  if (!answers || !Array.isArray(answers)) return badRequest('Se requiere answers array');

  try {
    const udb = userDb(auth.uid);
    const docId = `${date}_${type}`;

    await udb.reflections().doc(docId).set({
      id: docId,
      date,
      type,
      answers,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return created({ id: docId, date, type });
  } catch (e: any) {
    return serverError(e.message);
  }
}
