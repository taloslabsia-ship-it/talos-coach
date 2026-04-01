import { NextRequest, NextResponse } from 'next/server';
import { userDb } from '@/lib/firebase';
import { FieldValue } from 'firebase-admin/firestore';

function checkAuth(req: NextRequest) {
  const key = req.headers.get('x-api-key') ?? req.nextUrl.searchParams.get('api_key');
  return key === process.env.TALOS_API_SECRET;
}

const TALOS_USER_UID = process.env.TALOS_USER_UID || 'QXGkRXR6sZYJ5vYopNISy3wiSxN2';

function getUid() {
  return TALOS_USER_UID;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = params;
  if (!id) return NextResponse.json({ error: 'Missing note ID' }, { status: 400 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });

  const { title, content, category, status, completed } = body;
  const updates: any = {};

  if (title !== undefined) updates.title = title;
  if (content !== undefined) updates.content = content;
  if (category !== undefined) updates.category = category;
  if (status !== undefined) updates.status = status;
  if (completed !== undefined) updates.completed = completed;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  updates.updatedAt = FieldValue.serverTimestamp();

  try {
    const udb = userDb(getUid());
    await udb.notes().doc(id).update(updates);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === 'not-found') {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
