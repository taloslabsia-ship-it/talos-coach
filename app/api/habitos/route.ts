import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { toDateString } from '@/lib/utils';

function checkAuth(req: NextRequest) {
  const key = req.headers.get('x-api-key') ?? req.nextUrl.searchParams.get('api_key');
  return key === process.env.TALOS_API_SECRET;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const date = req.nextUrl.searchParams.get('date') ?? toDateString(new Date());

  try {
    const [habitsSnap, logsSnap] = await Promise.all([
      db.collection('habits').where('active', '==', true).orderBy('sortOrder').get(),
      db.collection('habit_logs').where('date', '==', date).get(),
    ]);

    const logs = logsSnap.docs.map(d => d.data());
    const result = habitsSnap.docs.map(d => {
      const h = d.data();
      const log = logs.find(l => l.habitId === d.id);
      return {
        id: d.id,
        name: h.name,
        emoji: h.emoji,
        timeLabel: h.timeLabel,
        completed: log?.completed ?? false,
        completedAt: log?.completedAt ?? null,
      };
    });

    const completed = result.filter(r => r.completed).length;
    return NextResponse.json({
      date,
      habits: result,
      summary: { 
        completed, 
        total: result.length, 
        percentage: result.length > 0 ? Math.round((completed / result.length) * 100) : 0 
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
