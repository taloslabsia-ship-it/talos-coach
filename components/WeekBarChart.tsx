'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { DayStats } from '@/lib/types';

const DAYS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export function WeekBarChart({ data }: { data: DayStats[] }) {
  const chartData = data.map((d) => {
    const date = new Date(d.date + 'T00:00:00');
    return {
      day: DAYS_ES[date.getDay()],
      pct: d.percentage,
      completed: d.completed,
      total: d.total,
    };
  });

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
        <XAxis
          dataKey="day"
          tick={{ fill: '#64748b', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fill: '#64748b', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}%`}
        />
        <Tooltip
          cursor={{ fill: 'rgba(255,255,255,0.05)' }}
          contentStyle={{
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '12px',
            fontSize: '12px',
            color: '#cbd5e1',
          }}
          formatter={(value: number, _name: string, props: any) =>
            [`${value}% (${props.payload.completed}/${props.payload.total})`, 'Cumplimiento']
          }
        />
        <Bar dataKey="pct" radius={[6, 6, 0, 0]}>
          {chartData.map((entry, index) => (
            <Cell
              key={index}
              fill={
                entry.pct === 100 ? '#22c55e' :
                entry.pct >= 50  ? '#3b82f6' :
                entry.pct > 0    ? '#f97316' :
                                   '#1e293b'
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
