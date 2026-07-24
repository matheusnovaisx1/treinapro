'use client';

import { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { formatDate } from '@/lib/utils';

type Log = { completed_at: string; loads?: Record<string, { weight?: string; reps?: string }> | null };

function parseWeight(w?: string): number | null {
  if (!w) return null;
  const n = parseFloat(String(w).replace(',', '.'));
  return isNaN(n) || n <= 0 ? null : n;
}

export function LoadProgressChart({
  logs,
  exerciseNameById,
}: {
  logs: Log[];
  exerciseNameById: Map<string, string>;
}) {
  // Série de peso por exercício, ordenada por data.
  const seriesByExercise = useMemo(() => {
    const map = new Map<string, { date: string; weight: number }[]>();
    // logs vêm em ordem decrescente; percorre e depois ordena crescente.
    for (const log of logs) {
      for (const [exId, v] of Object.entries(log.loads ?? {})) {
        const w = parseWeight(v?.weight);
        if (w === null) continue;
        if (!map.has(exId)) map.set(exId, []);
        map.get(exId)!.push({ date: log.completed_at, weight: w });
      }
    }
    for (const arr of map.values()) arr.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return map;
  }, [logs]);

  // Exercícios com dados, ordenados por quantidade de pontos (mais ricos primeiro).
  const options = useMemo(
    () =>
      Array.from(seriesByExercise.entries())
        .sort((a, b) => b[1].length - a[1].length)
        .map(([exId, pts]) => ({ exId, name: exerciseNameById.get(exId) ?? 'Exercício', count: pts.length })),
    [seriesByExercise, exerciseNameById]
  );

  const [selected, setSelected] = useState<string | undefined>(options[0]?.exId);
  const data = selected ? seriesByExercise.get(selected) ?? [] : [];

  if (!options.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Progressão de carga</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-sm text-muted-foreground">
            Quando o aluno registrar o peso nos treinos, a evolução de carga aparece aqui.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
        <CardTitle className="text-base">Progressão de carga</CardTitle>
        <Select value={selected} onValueChange={setSelected}>
          <SelectTrigger className="w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((o) => (
              <SelectItem key={o.exId} value={o.exId}>
                {o.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="h-72">
        {data.length < 2 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Só há um registro deste exercício. A curva aparece a partir do 2º treino com carga.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                tickFormatter={(d) => formatDate(d)}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                unit="kg"
                width={48}
              />
              <Tooltip
                labelFormatter={(d) => formatDate(d as string)}
                formatter={(v) => [`${v} kg`, 'Peso']}
                contentStyle={{
                  background: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 12,
                  color: 'hsl(var(--popover-foreground))',
                }}
                labelStyle={{ color: 'hsl(var(--popover-foreground))' }}
              />
              <Line
                type="monotone"
                dataKey="weight"
                name="Peso (kg)"
                stroke="hsl(var(--accent))"
                strokeWidth={2.5}
                dot={{ r: 3, fill: 'hsl(var(--accent))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
