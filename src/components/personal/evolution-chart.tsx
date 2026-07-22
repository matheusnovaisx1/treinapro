'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';

export type EvolutionPoint = {
  date: string;
  weight?: number | null;
  bodyFat?: number | null;
};

export function EvolutionChart({ data }: { data: EvolutionPoint[] }) {
  if (!data.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Evolução</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-sm text-muted-foreground">
            Ainda não há avaliações registradas para gerar o gráfico.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Evolução — peso e %gordura</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 18% 25%)" />
            <XAxis dataKey="date" tickFormatter={(d) => formatDate(d)} tick={{ fontSize: 12, fill: 'hsl(215 15% 65%)' }} />
            <YAxis tick={{ fontSize: 12, fill: 'hsl(215 15% 65%)' }} />
            <Tooltip labelFormatter={(d) => formatDate(d as string)} contentStyle={{ background: 'hsl(217 24% 14%)', border: '1px solid hsl(217 18% 25%)', borderRadius: 12, color: 'hsl(210 20% 96%)' }} labelStyle={{ color: 'hsl(210 20% 96%)' }} />
            <Legend wrapperStyle={{ fontSize: 12, color: 'hsl(210 20% 96%)' }} />
            <Line type="monotone" dataKey="weight" name="Peso (kg)" stroke="hsl(199 89% 60%)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="bodyFat" name="% Gordura" stroke="hsl(24 95% 53%)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
