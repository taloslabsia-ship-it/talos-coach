/**
 * Script para poblar Firestore con hábitos y frases iniciales.
 *
 * Uso:
 *   1. Poner el service account en FIREBASE_SERVICE_ACCOUNT_KEY o como archivo
 *   2. npx tsx scripts/seed-firestore.ts
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import * as fs from 'fs';
import * as path from 'path';

// Intentar cargar service account local
const saPath = path.join(process.cwd(), 'service-account.json');
if (fs.existsSync(saPath)) {
  const sa = JSON.parse(fs.readFileSync(saPath, 'utf8'));
  initializeApp({ credential: cert(sa) });
} else if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  initializeApp({ credential: cert(sa) });
} else {
  initializeApp(); // ADC
}

const db = getFirestore();

const HABITS = [
  { name: 'Escribir pensamientos',    emoji: '✍️', description: 'Escribir reflexiones matutinas en el diario',  timeLabel: '5:30 AM',  sortOrder: 1, active: true },
  { name: 'Frase motivadora',         emoji: '💡', description: 'Leer y reflexionar sobre la frase del día',    timeLabel: '6:00 AM',  sortOrder: 2, active: true },
  { name: 'Hidratación y movimiento', emoji: '💧', description: 'Tomar agua y hacer actividad física',          timeLabel: '10:00 AM', sortOrder: 3, active: true },
  { name: 'Leer en Headway',          emoji: '📚', description: 'Leer al menos 10 minutos en Headway',          timeLabel: '10:30 PM', sortOrder: 4, active: true },
  { name: 'Cierre del día',           emoji: '🌙', description: 'Revisar el día, preparar el mañana, relajarse',timeLabel: '10:30 PM', sortOrder: 5, active: true },
];

const PHRASES = [
  { phrase: 'La disciplina es elegir entre lo que quieres ahora y lo que más quieres.',       author: 'Abraham Lincoln' },
  { phrase: 'El éxito es la suma de pequeños esfuerzos repetidos día tras día.',              author: 'Robert Collier' },
  { phrase: 'No se trata de ser mejor que los demás, sino de ser mejor que ayer.',           author: null },
  { phrase: 'Cada día es una nueva oportunidad para cambiar tu vida.',                        author: null },
  { phrase: 'La constancia vence lo que la dicha no alcanza.',                               author: 'Refrán' },
  { phrase: 'Haz hoy lo que otros no harán para poder mañana lo que otros no pueden.',       author: 'Jerry Rice' },
  { phrase: 'El único mal entrenamiento es el que no se hizo.',                              author: null },
  { phrase: 'Pequeños pasos diarios llevan a grandes resultados anuales.',                   author: null },
  { phrase: 'Tu cuerpo puede hacerlo. Es tu mente a quien tienes que convencer.',            author: null },
  { phrase: 'La motivación te pone en marcha, el hábito te mantiene en movimiento.',         author: 'Jim Rohn' },
];

async function seed() {
  console.log('🌱 Seeding Firestore...\n');

  // Hábitos
  const batch = db.batch();
  for (const habit of HABITS) {
    const ref = db.collection('habits').doc();
    batch.set(ref, { ...habit, createdAt: FieldValue.serverTimestamp() });
    console.log(`  ✅ Hábito: ${habit.emoji} ${habit.name}`);
  }

  for (const phrase of PHRASES) {
    const ref = db.collection('motivational_phrases').doc();
    batch.set(ref, { ...phrase, usedOn: null, createdAt: FieldValue.serverTimestamp() });
  }
  console.log(`  ✅ ${PHRASES.length} frases motivadoras`);

  await batch.commit();
  console.log('\n✨ Seed completado con éxito!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Error en seed:', err);
  process.exit(1);
});
