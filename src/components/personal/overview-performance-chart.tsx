'use client';

import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';

export type WeeklyStat = { week: string; trainings: number; avgPse: number | null };

export function OverviewPerformanceChart({ data }: { data: WeeklyStat[] }) {
  if (!data.some((d) => d.trainings > 0)) {
    return <p className="py-10 text-center text-sm text-muted-foreground">Sem treinos registrados nas últimas semanas ainda.</p>;
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(217 18% 25%)" />
          <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'hsl(215 15% 65%)' }} />
          <YAxis yAxisId="left" allowDecimals={false} tick={{ fontSize: 11, fill: 'hsl(215 15% 65%)' }} />
          <YAxis yAxisId="right" orientation="right" domain={[0, 10]} tick={{ fontSize: 11, fill: 'hsl(215 15% 65%)' }} />
          <Tooltip contentStyle={{ background: 'hsl(217 24% 14%)', border: '1px solid hsl(217 18% 25%)', borderRadius: 12, color: 'hsl(210 20% 96%)' }} labelStyle={{ color: 'hsl(210 20% 96%)' }} />
          <Legend wrapperStyle={{ fontSize: 12, color: 'hsl(210 20% 96%)' }} />
          <Bar yAxisId="left" dataKey="trainings" name="Treinos concluídos" fill="hsl(145 80% 45%)" radius={[4, 4, 0, 0]} />
          <Line yAxisId="right" type="monotone" dataKey="avgPse" name="PSE médio" stroke="hsl(24 95% 53%)" strokeWidth={2} dot={{ r: 3 }} connectNulls />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
