import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { toDateString } from '@/lib/utils';

function checkAuth(req: NextRequest) {
  const key = req.headers.get('x-api-key') ?? req.nextUrl.searchParams.get('api_key');
  return key === process.env.TALOS_API_SECRET;
}

async function getStreak(): Promise<number> {
  const logsSnap = await db.collection('habit_logs')
    .where('completed', '==', true)
    .orderBy('date', 'desc')
    .limit(200)
    .get();

  if (logsSnap.empty) return 0;

  const dateSet = new Set(logsSnap.docs.map(d => d.data().date as string));
  let streak = 0;
  const today = new Date();

  for (let i = 0; i < 200; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const ds = toDateString(d);
    if (dateSet.has(ds)) streak++;
    else if (i > 0) break;
  }
  return streak;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const today = toDateString(new Date());
    
    // Habitos de hoy
    const [habitsSnap, logsTodaySnap, notesCount, diaryCount, streak] = await Promise.all([
      db.collection('habits').where('active', '==', true).get(),
      db.collection('habit_logs').where('date', '==', today).get(),
      db.collection('notes').count().get(),
      db.collection('diary_entries').count().get(),
      getStreak(),
    ]);

    const habitsCount = habitsSnap.size;
    const completedToday = logsTodaySnap.docs.filter(d => d.data().completed).length;

    return NextResponse.json({
      streak,
      habits: {
        total: habitsCount,
        completed_today: completedToday,
        percentage_today: habitsCount > 0 ? Math.round((completedToday / habitsCount) * 100) : 0,
      },
      counters: {
        total_notes: notesCount.data().count,
        total_diary_entries: diaryCount.data().count,
      },
      timestamp: new Date().toISOString(),
      timezone: 'America/Argentina/Buenos_Aires',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
