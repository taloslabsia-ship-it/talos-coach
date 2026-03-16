import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';

function checkAuth(req: NextRequest) {
  const key = req.headers.get('x-api-key') ?? req.nextUrl.searchParams.get('api_key');
  return key === process.env.TALOS_API_SECRET;
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const status = body?.status ?? 'done';

  try {
    await db.collection('reminders').doc(params.id).update({ status });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
