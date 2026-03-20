import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { FieldValue } from 'firebase-admin/firestore';
import { getSessionUser } from '@/lib/session';

// POST /api/admin/migrate
// Migra los datos planos (single-tenant) a users/{uid}/... del usuario logueado.
export async function POST(_req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { uid } = user;
  const base = db.collection('users').doc(uid);

  const COLLECTIONS = [
    { from: 'habits',        to: 'habits' },
    { from: 'habit_logs',    to: 'habit_logs' },
    { from: 'notes',         to: 'notes' },
    { from: 'diary_entries', to: 'diary_entries' },
    { from: 'reminders',     to: 'reminders' },
  ];

  const CONFIG_DOCS = ['profile', 'google_oauth', 'ventas_comercios'];
  const results: Record<string, number> = {};

  try {
    for (const { from, to } of COLLECTIONS) {
      const snap = await db.collection(from).get();
      if (snap.empty) { results[from] = 0; continue; }

      // Firestore batch tiene límite de 500 ops
      const chunks = [];
      for (let i = 0; i < snap.docs.length; i += 400) {
        chunks.push(snap.docs.slice(i, i + 400));
      }
      for (const chunk of chunks) {
        const batch = db.batch();
        chunk.forEach(doc => batch.set(base.collection(to).doc(doc.id), doc.data(), { merge: true }));
        await batch.commit();
      }
      results[from] = snap.size;
    }

    for (const docId of CONFIG_DOCS) {
      const doc = await db.collection('config').doc(docId).get();
      if (doc.exists) {
        await base.collection('config').doc(docId).set(doc.data()!, { merge: true });
        results[`config/${docId}`] = 1;
      }
    }

    await base.set({
      email: user.email,
      migratedAt: FieldValue.serverTimestamp(),
      subscription: { status: 'active', plan: 'plus', expiresAt: null },
    }, { merge: true });

    return NextResponse.json({ ok: true, uid, results });
  } catch (e: any) {
    console.error('Migration error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
