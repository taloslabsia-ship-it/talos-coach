import { NextRequest } from 'next/server';
import { userDb } from '@/lib/firebase';
import { FieldValue } from 'firebase-admin/firestore';
import { resolveAuthUid, unauthorized, badRequest, notFound, ok, serverError } from '@/lib/api-auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await resolveAuthUid(req);
  if (!auth) return unauthorized();

  try {
    const udb = userDb(auth.uid);
    const doc = await udb.notes().doc(params.id).get();
    if (!doc.exists) return notFound('Nota no encontrada');
    return ok({ id: doc.id, ...doc.data() });
  } catch (e: any) {
    return serverError(e.message);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await resolveAuthUid(req);
  if (!auth) return unauthorized();

  const body = await req.json().catch(() => null);
  if (!body) return badRequest('Invalid JSON');

  try {
    const udb = userDb(auth.uid);
    const updates: any = { updatedAt: FieldValue.serverTimestamp() };

    if ('title' in body) updates.title = body.title;
    if ('content' in body) updates.content = body.content;
    if ('category' in body) updates.category = body.category;
    if ('status' in body) updates.status = body.status;
    if ('completed' in body) updates.completed = body.completed;

    await udb.notes().doc(params.id).update(updates);
    return ok({ id: params.id });
  } catch (e: any) {
    if (e.code === 'not-found') return notFound('Nota no encontrada');
    return serverError(e.message);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await resolveAuthUid(req);
  if (!auth) return unauthorized();

  try {
    const udb = userDb(auth.uid);
    await udb.notes().doc(params.id).delete();
    return ok({ id: params.id });
  } catch (e: any) {
    return serverError(e.message);
  }
}
