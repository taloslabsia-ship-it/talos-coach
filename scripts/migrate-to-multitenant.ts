/**
 * Script de migración: mueve los datos de las colecciones planas (single-tenant)
 * a las subcollecciones de usuario (multi-tenant): users/{uid}/...
 *
 * Uso:
 *   MIGRATE_UID=<tu-firebase-uid> npx tsx scripts/migrate-to-multitenant.ts
 *
 * Tu UID lo podés ver en Firebase Console → Authentication → Users
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import * as fs from 'fs';

// Init Firebase Admin
if (getApps().length === 0) {
  const saPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const saKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (saKey) {
    initializeApp({ credential: cert(JSON.parse(saKey)) });
  } else if (saPath && fs.existsSync(saPath)) {
    initializeApp({ credential: cert(JSON.parse(fs.readFileSync(saPath, 'utf8'))) });
  } else {
    initializeApp(); // ADC
  }
}

const db = getFirestore();

const COLLECTIONS = [
  { from: 'habits',          to: 'habits' },
  { from: 'habit_logs',      to: 'habit_logs' },
  { from: 'notes',           to: 'notes' },
  { from: 'diary_entries',   to: 'diary_entries' },
  { from: 'reminders',       to: 'reminders' },
];

const CONFIG_DOCS = ['profile', 'google_oauth', 'ventas_comercios'];

async function migrate(uid: string) {
  console.log(`\n🚀 Migrando datos al usuario: ${uid}\n`);
  const base = db.collection('users').doc(uid);

  for (const { from, to } of COLLECTIONS) {
    const snap = await db.collection(from).get();
    if (snap.empty) {
      console.log(`  ⏭  ${from}: vacío, skip`);
      continue;
    }

    let count = 0;
    const batch = db.batch();
    for (const doc of snap.docs) {
      batch.set(base.collection(to).doc(doc.id), doc.data(), { merge: true });
      count++;
    }
    await batch.commit();
    console.log(`  ✅ ${from} → users/${uid}/${to} (${count} docs)`);
  }

  // Migrar config/
  for (const docId of CONFIG_DOCS) {
    const doc = await db.collection('config').doc(docId).get();
    if (doc.exists) {
      await base.collection('config').doc(docId).set(doc.data()!, { merge: true });
      console.log(`  ✅ config/${docId} → users/${uid}/config/${docId}`);
    }
  }

  // Crear documento base del usuario si no existe
  await base.set({
    migratedAt: FieldValue.serverTimestamp(),
    subscription: { status: 'active', plan: 'plus', expiresAt: null },
  }, { merge: true });

  console.log(`\n✅ Migración completada para uid: ${uid}`);
  console.log(`\n⚠️  Los datos originales NO fueron borrados.`);
  console.log(`   Una vez que verifiques que todo funciona, podés borrar las colecciones viejas.`);
}

const uid = process.env.MIGRATE_UID;
if (!uid) {
  console.error('❌ Falta MIGRATE_UID. Usá: MIGRATE_UID=<tu-uid> npx tsx scripts/migrate-to-multitenant.ts');
  process.exit(1);
}

migrate(uid).catch(e => { console.error('❌ Error:', e); process.exit(1); });
