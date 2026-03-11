import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { FieldValue } from 'firebase-admin/firestore';

function checkAuth(req: NextRequest) {
  const key = req.headers.get('x-api-key') ?? req.nextUrl.searchParams.get('api_key');
  return key === process.env.TALOS_API_SECRET;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });

  const ref = db.collection('notes').doc(params.id);
  const doc = await ref.get();
  if (!doc.exists) return NextResponse.json({ error: 'Note not found' }, { status: 404 });

  const updates: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };
  if (typeof body.completed === 'boolean') updates.completed = body.completed;
  if (body.title) updates.title = body.title;
  if (body.content) updates.content = body.content;
  if (body.category) updates.category = body.category;

  await ref.update(updates);
  return NextResponse.json({ success: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const ref = db.collection('notes').doc(params.id);
  const doc = await ref.get();
  if (!doc.exists) return NextResponse.json({ error: 'Note not found' }, { status: 404 });

  await ref.delete();
  return NextResponse.json({ success: true });
}
