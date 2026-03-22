import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/session';

export async function GET() {
  const user = await getSessionUser();
  return NextResponse.json({ uid: user?.uid ?? null, email: user?.email ?? null });
}
