import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getSessionUser } from '@/lib/session';

// GET /api/auth/client-token — genera un Firebase custom token para autenticar el cliente
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const customToken = await getAuth().createCustomToken(user.uid);
  return NextResponse.json({ token: customToken });
}
