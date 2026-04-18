import { NextRequest } from 'next/server';
import { db } from '@/lib/firebase';
import { FieldValue } from 'firebase-admin/firestore';
import { resolveAuthUid, unauthorized, badRequest, ok, created, serverError } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
  const auth = await resolveAuthUid(req);
  if (!auth) return unauthorized();

  const status = req.nextUrl.searchParams.get('status') ?? 'pending';

  try {
    const collection = db.collection('reminders');
    let q = collection.where('userId', '==', auth.uid);

    if (status !== 'all') {
      q = q.where('status', '==', status);
    }

    q = q.orderBy('status', 'asc').orderBy('date', 'asc').orderBy('time', 'asc');

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

  const { text, date, time } = body;

  if (!text) return badRequest('Se requiere text');
  if (!date) return badRequest('Se requiere date (formato: YYYY-MM-DD)');
  if (!time) return badRequest('Se requiere time (formato: HH:MM)');

  // Validar formato de date
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return badRequest('Formato de date inválido: usar YYYY-MM-DD');
  }

  // Validar formato de time
  if (!/^\d{2}:\d{2}$/.test(time)) {
    return badRequest('Formato de time inválido: usar HH:MM');
  }

  try {
    const ref = await db.collection('reminders').add({
      text,
      date,
      time,
      status: 'pending',
      userId: auth.uid,
      source: auth.isApiKey ? 'talos_api' : 'manual',
      createdAt: FieldValue.serverTimestamp(),
    });

    return created({ id: ref.id });
  } catch (e: any) {
    return serverError(e.message);
  }
}
