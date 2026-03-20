import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { db } from '@/lib/firebase';
import { FieldValue } from 'firebase-admin/firestore';

const SESSION_DURATION_MS = 60 * 60 * 24 * 14 * 1000; // 14 días

// POST /api/auth/session — crea la session cookie a partir de un ID token
export async function POST(req: NextRequest) {
  const { idToken } = await req.json();
  if (!idToken) return NextResponse.json({ error: 'Missing token' }, { status: 400 });

  try {
    const auth = getAuth();
    const decoded = await auth.verifyIdToken(idToken);

    // Crear (o actualizar) el doc del usuario en Firestore
    await db.collection('users').doc(decoded.uid).set({
      email: decoded.email || '',
      name: decoded.name || '',
      photoURL: decoded.picture || '',
      lastLoginAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    // Crear session cookie de Firebase (14 días)
    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn: SESSION_DURATION_MS,
    });

    const res = NextResponse.json({ ok: true });
    res.cookies.set('__session', sessionCookie, {
      httpOnly: true,
      secure: true,
      maxAge: SESSION_DURATION_MS / 1000,
      path: '/',
      sameSite: 'lax',
    });
    return res;
  } catch (e: any) {
    console.error('Session creation error:', e);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

// DELETE /api/auth/session — cierra sesión
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set('__session', '', { maxAge: 0, path: '/' });
  return res;
}
