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
