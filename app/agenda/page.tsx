import { db, toISO } from '@/lib/firebase';
import { AgendaClient } from '@/components/AgendaClient';

export const dynamic = 'force-dynamic';

async function getReminders() {
  const snap = await db.collection('reminders').get();

  const today = new Date().toISOString().split('T')[0];

  const all = snap.docs
    .map(d => {
      const data = d.data();
      return {
        id: d.id,
        text: data.text ?? '',
        date: data.date ?? '',
        time: data.time ?? '',
        status: data.status ?? 'pending',
        createdAt: toISO(data.createdAt) ?? '',
      };
    })
    .filter(r => r.date) // descartar sin fecha
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));

  const proximos = all.filter(r => r.date >= today && r.status === 'pending');
  const pasados = all
    .filter(r => r.date < today || r.status === 'done')
    .reverse(); // más reciente primero

  return { proximos, pasados };
}

export default async function AgendaPage() {
  try {
    const { proximos, pasados } = await getReminders();
    const total = proximos.length + pasados.length;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Agenda</h1>
            <p className="text-slate-400 text-sm mt-1">
              {proximos.length} pendiente{proximos.length !== 1 ? 's' : ''} · {total} en total
            </p>
          </div>
          <span className="text-3xl">📅</span>
        </div>

        <AgendaClient proximos={proximos} pasados={pasados} />
      </div>
    );
  } catch (error: any) {
    return (
      <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400">
        <p className="font-bold">Error cargando agenda</p>
        <p className="text-sm font-mono mt-2">{error.message}</p>
      </div>
    );
  }
}
