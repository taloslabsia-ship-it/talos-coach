import { NextRequest } from 'next/server';
import { db } from '@/lib/firebase';
import { FieldValue } from 'firebase-admin/firestore';
import { resolveAuthUid, unauthorized, badRequest, notFound, ok, serverError } from '@/lib/api-auth';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await resolveAuthUid(req);
  if (!auth) return unauthorized();

  const body = await req.json().catch(() => null);
  if (!body) return badRequest('Invalid JSON');

  try {
    const updates: any = { updatedAt: FieldValue.serverTimestamp() };

    if ('status' in body) updates.status = body.status;
    if ('text' in body) updates.text = body.text;
    if ('date' in body) updates.date = body.date;
    if ('time' in body) updates.time = body.time;

    await db.collection('reminders').doc(params.id).update(updates);
    return ok({ id: params.id });
  } catch (e: any) {
    if (e.code === 'not-found') return notFound('Evento no encontrado');
    return serverError(e.message);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await resolveAuthUid(req);
  if (!auth) return unauthorized();

  try {
    await db.collection('reminders').doc(params.id).delete();
    return ok({ id: params.id });
  } catch (e: any) {
    return serverError(e.message);
  }
}
