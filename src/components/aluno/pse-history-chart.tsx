'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export function PseHistoryChart({ data }: { data: { date: string; pse: number }[] }) {
  if (!data.length) {
    return <p className="py-6 text-center text-sm text-muted-foreground">Sem dados suficientes ainda.</p>;
  }

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(217 18% 25%)" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'hsl(215 15% 65%)' }} />
          <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: 'hsl(215 15% 65%)' }} />
          <Tooltip contentStyle={{ background: 'hsl(217 24% 14%)', border: '1px solid hsl(217 18% 25%)', borderRadius: 12, color: 'hsl(210 20% 96%)' }} labelStyle={{ color: 'hsl(210 20% 96%)' }} />
          <Line type="monotone" dataKey="pse" stroke="hsl(24 95% 53%)" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
