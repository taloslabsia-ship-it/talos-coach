import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

function initAdmin() {
  if (getApps().length > 0) return getApps()[0];

  // Firebase App Hosting provee credenciales automáticamente via ADC.
  // Para desarrollo local, setear FIREBASE_SERVICE_ACCOUNT_KEY con el JSON del service account.
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    return initializeApp({ credential: cert(sa) });
  }

  // Application Default Credentials (funciona en Firebase App Hosting automáticamente)
  return initializeApp();
}

initAdmin();

export const db = getFirestore();

// Helper: devuelve referencias de colecciones scoped a un usuario
export function userDb(uid: string) {
  const base = db.collection('users').doc(uid);
  return {
    habits:    () => base.collection('habits'),
    habitLogs: () => base.collection('habit_logs'),
    notes:     () => base.collection('notes'),
    diary:     () => base.collection('diary_entries'),
    reminders: () => base.collection('reminders'),
    config:    (docId: string) => base.collection('config').doc(docId),
    phrases:   () => db.collection('motivational_phrases'), // compartido entre usuarios
    userDoc:   () => base,
  };
}

// Helper: convierte Firestore Timestamp o string a ISO string
export function toISO(val: unknown): string | null {
  if (!val) return null;
  if (val instanceof Timestamp) return val.toDate().toISOString();
  if (typeof val === 'string') return val;
  return null;
}

// Helper: convierte snapshot doc a objeto plano con id
export function docToObj<T>(doc: FirebaseFirestore.DocumentSnapshot): T {
  return { id: doc.id, ...doc.data() } as T;
}
