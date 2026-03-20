import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { db } from '@/lib/firebase';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * POST /api/webhooks/subscription
 *
 * Llamado desde la plataforma admin de TALOS cuando cambia el estado de una licencia.
 *
 * Headers:
 *   x-webhook-secret: <WEBHOOK_SECRET del .env>
 *
 * Body:
 *   {
 *     email: string,           // email del usuario en TALOS Coach
 *     status: 'trial' | 'active' | 'expired' | 'blocked',
 *     plan?: 'free' | 'plus',
 *     expiresAt?: string,      // ISO date o null
 *   }
 */
export async function POST(req: NextRequest) {
  // Verificar secret
  const secret = req.headers.get('x-webhook-secret');
  if (!secret || secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { email, status, plan = 'plus', expiresAt } = body;

  if (!email || !status) {
    return NextResponse.json({ error: 'Missing email or status' }, { status: 400 });
  }

  const validStatuses = ['trial', 'active', 'expired', 'blocked'];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: `Invalid status. Use: ${validStatuses.join(', ')}` }, { status: 400 });
  }

  try {
    // Buscar uid por email en Firebase Auth
    const userRecord = await getAuth().getUserByEmail(email);
    const uid = userRecord.uid;

    // Actualizar suscripción en Firestore
    await db.collection('users').doc(uid).set({
      subscription: {
        status,
        plan,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        updatedAt: FieldValue.serverTimestamp(),
      },
    }, { merge: true });

    console.log(`[Subscription webhook] ${email} (${uid}) → ${status}`);
    return NextResponse.json({ ok: true, uid, status });

  } catch (e: any) {
    if (e.code === 'auth/user-not-found') {
      return NextResponse.json({ error: `No existe usuario con email: ${email}` }, { status: 404 });
    }
    console.error('Webhook error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
