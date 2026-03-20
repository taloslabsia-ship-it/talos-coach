import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAuth } from 'firebase-admin/auth';
import '@/lib/firebase'; // asegura initAdmin()
import { db } from '@/lib/firebase';
import type { SessionUser } from '@/lib/types';

/** Verifica la session cookie y retorna el usuario, o null si no hay sesión. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('__session')?.value;
  if (!sessionCookie) return null;

  try {
    const decoded = await getAuth().verifySessionCookie(sessionCookie, true);
    return {
      uid: decoded.uid,
      email: decoded.email || '',
      name: decoded.name,
    };
  } catch {
    return null;
  }
}

/** Retorna el usuario autenticado. Redirige a /login si no hay sesión válida. */
export async function requireSession(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  return user;
}

/**
 * Retorna el usuario autenticado y verifica que la suscripción esté activa.
 * Redirige a /subscribe si expiró o fue bloqueada.
 */
export async function requireActiveSession(): Promise<SessionUser> {
  const user = await requireSession();

  const userDoc = await db.collection('users').doc(user.uid).get();
  const sub = userDoc.data()?.subscription;

  if (sub && (sub.status === 'expired' || sub.status === 'blocked')) {
    redirect('/subscribe');
  }

  return user;
}
