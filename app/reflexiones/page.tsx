import { db, userDb, toISO } from '@/lib/firebase';
import Markdown from 'react-markdown';

interface Reflection {
  id: string;
  date: string;
  type: 'morning' | 'evening';
  answers: Array<{ question: string; answer: string }>;
  createdAt: string;
  updatedAt: string;
}

interface WeeklyAnalysis {
  id: string;
  weekStart: string;
  weekEnd: string;
  reflectionsCount: number;
  analysis: string;
  createdAt: string;
}

export const dynamic = 'force-dynamic';

async function getReflectionsData() {
  try {
    const uid = process.env.TALOS_USER_UID || 'QXGkRXR6sZYJ5vYopNISy3wiSxN2';
    const udb = userDb(uid);

    // Obtener últimas 30 reflexiones
    const reflectionsSnap = await udb
      .reflections()
      .orderBy('date', 'desc')
      .limit(30)
      .get();

    const reflections = reflectionsSnap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        createdAt: toISO(data.createdAt) ?? '',
        updatedAt: toISO(data.updatedAt) ?? '',
      } as Reflection;
    });

    // Obtener últimos 4 análisis semanales
    const analysisSnap = await db
      .collection('users')
      .doc(uid)
      .collection('weekly_analyses')
      .orderBy('createdAt', 'desc')
      .limit(4)
      .get();

    const analyses = analysisSnap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        createdAt: toISO(data.createdAt) ?? '',
      } as WeeklyAnalysis;
    });

    return { reflections, analyses };
  } catch (err) {
    console.error('Error obteniendo reflexiones:', err);
    return { reflections: [], analyses: [] };
  }
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-AR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default async function ReflexionesPage() {
  const { reflections, analyses } = await getReflectionsData();

  const morningReflections = reflections.filter(r => r.type === 'morning');
  const eveningReflections = reflections.filter(r => r.type === 'evening');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Reflexiones</h1>
        <p className="text-slate-400 text-sm mt-1">
          Tu desarrollo personal documentado. Mañana y noche reflexiones + análisis semanal.
        </p>
      </div>

      {/* Análisis Semanal */}
      {analyses.length > 0 && (
        <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-cyan-400 mb-4">📊 Último Análisis Semanal</h2>
          <div className="space-y-2 text-slate-300">
            <p className="text-xs text-slate-400">
              {analyses[0].weekStart} a {analyses[0].weekEnd} ({analyses[0].reflectionsCount} reflexiones)
            </p>
            <div className="prose prose-invert max-w-none text-sm leading-relaxed">
              <Markdown>{analyses[0].analysis}</Markdown>
            </div>
          </div>

          {/* Otros análisis */}
          {analyses.length > 1 && (
            <details className="mt-4 pt-4 border-t border-slate-700/50">
              <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-300 transition">
                Ver análisis anteriores ({analyses.length - 1})
              </summary>
              <div className="mt-4 space-y-4">
                {analyses.slice(1).map(analysis => (
                  <div key={analysis.id} className="p-4 bg-slate-900/50 rounded border border-slate-700/50">
                    <p className="text-xs text-slate-400 mb-2">
                      {analysis.weekStart} a {analysis.weekEnd}
                    </p>
                    <div className="prose prose-invert max-w-none text-xs leading-relaxed">
                      <Markdown>{analysis.analysis}</Markdown>
                    </div>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      )}

      {/* Reflexiones del historial */}
      <div className="grid gap-6">
        {reflections.length > 0 ? (
          reflections.map(reflection => (
            <div key={reflection.id} className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-5 hover:border-slate-600/50 transition">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-white">
                    {reflection.type === 'morning' ? '🌅' : '🌙'} {reflection.type === 'morning' ? 'Reflexión Matutina' : 'Reflexión Nocturna'}
                  </h3>
                  <p className="text-sm text-slate-400">{formatDate(reflection.date)}</p>
                </div>
              </div>

              <div className="space-y-4">
                {reflection.answers.map((answer, idx) => (
                  <div key={idx} className="border-l-2 border-cyan-500/30 pl-4">
                    <p className="text-sm font-medium text-slate-200 mb-1">{answer.question}</p>
                    <p className="text-sm text-slate-400">{answer.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-slate-800/30 rounded-lg border border-slate-700/50">
            <p className="text-slate-400 text-sm">
              Sin reflexiones aún. Escribe "reflexion mañana" o "reflexion noche" en el bot para empezar.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
