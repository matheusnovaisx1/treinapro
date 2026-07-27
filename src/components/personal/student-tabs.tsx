'use client';

import Link from 'next/link';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dumbbell, Plus, Copy, CalendarRange, ArrowRight, Pencil } from 'lucide-react';
import { StudentNotes } from '@/components/personal/student-notes';
import { EvolutionChart, type EvolutionPoint } from '@/components/personal/evolution-chart';
import { LoadProgressChart } from '@/components/personal/load-progress-chart';
import { EmptyState } from '@/components/ui/empty-state';
import { SendAnamneseDialog } from '@/components/personal/send-anamnese-dialog';
import { RequestAssessmentDialog } from '@/components/personal/request-assessment-dialog';
import { AssessmentImages } from '@/components/personal/assessment-images';
import { AssessmentComparisonCard } from '@/components/personal/assessment-comparison-card';
import { ExportReportButton } from '@/components/personal/export-report-button';
import { formatDate, cn } from '@/lib/utils';
import { formatDurationLabel } from '@/lib/workout-format';

export function StudentTabs({
  studentId,
  studentName,
  studentEmail,
  notes,
  anamneses,
  assessments,
  workouts,
  workoutLogs,
  templates,
  evolutionData,
}: {
  studentId: string;
  studentName: string;
  studentEmail: string;
  notes: string | null;
  anamneses: any[];
  assessments: any[];
  workouts: any[];
  workoutLogs: any[];
  templates: any[];
  evolutionData: EvolutionPoint[];
}) {
  // Mapa exercise_id -> nome (a partir dos treinos), para exibir as cargas.
  const exerciseNameById = new Map<string, string>();
  for (const w of workouts) {
    for (const d of (w.days as any[]) ?? []) {
      for (const e of (d.exercises as any[]) ?? []) {
        if (e.exercise_id && e.name) exerciseNameById.set(e.exercise_id, e.name);
      }
    }
  }

  // Resumo de acompanhamento (frequência e esforço médio).
  const now = Date.now();
  const last30 = workoutLogs.filter(
    (l) => now - new Date(l.completed_at).getTime() <= 30 * 24 * 60 * 60 * 1000
  ).length;
  const pseValues = workoutLogs.map((l) => l.pse).filter((v): v is number => typeof v === 'number');
  const avgPse = pseValues.length ? Math.round((pseValues.reduce((a, b) => a + b, 0) / pseValues.length) * 10) / 10 : null;

  return (
    <Tabs defaultValue="dados">
      <TabsList>
        <TabsTrigger value="dados">Dados</TabsTrigger>
        <TabsTrigger value="anamnese">Anamnese</TabsTrigger>
        <TabsTrigger value="avaliacoes">Avaliações</TabsTrigger>
        <TabsTrigger value="treinos">Treinos</TabsTrigger>
        <TabsTrigger value="periodizacao">Periodização</TabsTrigger>
        <TabsTrigger value="feedbacks">Feedbacks</TabsTrigger>
      </TabsList>

      {/* PERIODIZAÇÃO */}
      <TabsContent value="periodizacao" className="space-y-4">
        <Card>
          <CardContent className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <CalendarRange className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-display text-lg font-semibold">Plano de periodização</h3>
              <p className="text-sm text-muted-foreground">
                Organize a evolução de {studentName.split(' ')[0]} em fases (adaptação, construção, força e
                descanso). O app mostra ao aluno em que fase e semana ele está.
              </p>
            </div>
            <Button variant="accent" asChild>
              <Link href={`/personal/alunos/${studentId}/plano`}>
                Abrir periodização <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      {/* DADOS */}
      <TabsContent value="dados" className="space-y-6">
        <EvolutionChart data={evolutionData} />
        <LoadProgressChart logs={workoutLogs} exerciseNameById={exerciseNameById} />
        <StudentNotes studentId={studentId} initialNotes={notes} />
      </TabsContent>

      {/* ANAMNESE */}
      <TabsContent value="anamnese" className="space-y-4">
        <div className="flex justify-end">
          <SendAnamneseDialog studentId={studentId} templates={templates} />
        </div>
        {!anamneses.length && <EmptyState emoji="📋" title="Nenhuma anamnese ainda" description="Envie uma anamnese para conhecer melhor o aluno." />}
        {anamneses.map((a) => (
          <Card key={a.id}>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Enviada em {formatDate(a.sent_at)}</CardTitle>
              <Badge variant={a.status === 'completed' ? 'success' : 'secondary'}>
                {a.status === 'completed' ? 'Respondida' : 'Pendente'}
              </Badge>
            </CardHeader>
            {a.status === 'completed' && (
              <CardContent className="space-y-3">
                {(a.questions ?? []).map((q: any) => (
                  <div key={q.id} className="border-b pb-2 text-sm last:border-0">
                    <p className="font-medium">{q.text}</p>
                    <p className="text-muted-foreground">{a.answers?.[q.id] ?? '—'}</p>
                  </div>
                ))}
              </CardContent>
            )}
          </Card>
        ))}
      </TabsContent>

      {/* AVALIAÇÕES */}
      <TabsContent value="avaliacoes" className="space-y-4">
        <div className="flex justify-end">
          <RequestAssessmentDialog studentId={studentId} />
        </div>
        <AssessmentComparisonCard assessments={assessments} />
        {!assessments.length && <EmptyState emoji="📸" title="Nenhuma avaliação ainda" description="Peça fotos e medidas para acompanhar a evolução física." />}
        {assessments.map((a) => (
          <Card key={a.id}>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base capitalize">{a.type}</CardTitle>
              <span className="text-xs text-muted-foreground">{formatDate(a.created_at)}</span>
            </CardHeader>
            <CardContent className="space-y-4">
              {!!Object.keys(a.data ?? {}).length && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {Object.entries(a.data).map(([key, value]) => (
                    <div key={key} className="rounded-md bg-muted p-3">
                      <p className="text-xs capitalize text-muted-foreground">{key}</p>
                      <p className="font-semibold">{String(value)}</p>
                    </div>
                  ))}
                </div>
              )}
              <AssessmentImages paths={a.images ?? []} />
            </CardContent>
          </Card>
        ))}
      </TabsContent>

      {/* TREINOS */}
      <TabsContent value="treinos" className="space-y-4">
        <div className="flex justify-end">
          <Button size="sm" variant="accent" asChild>
            <Link href={`/personal/alunos/${studentId}/treino/novo`}>
              <Plus className="h-4 w-4" /> Novo treino
            </Link>
          </Button>
        </div>
        {!workouts.length && <EmptyState emoji="🏋️" title="Nenhum treino ainda" description="Monte a primeira rotina de treino para este aluno." />}
        {workouts.map((w) => (
          <Card key={w.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Dumbbell className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">{w.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {w.start_date ? formatDate(w.start_date) : '—'} até {w.end_date ? formatDate(w.end_date) : 'sem data fim'} ·{' '}
                    {(w.days ?? []).length} dia(s)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {w.is_extra && <Badge variant="secondary">Extra</Badge>}
                <Badge variant={w.is_active ? 'success' : 'secondary'}>{w.is_active ? 'Ativo' : 'Encerrado'}</Badge>
                <Button size="sm" variant="ghost" asChild>
                  <Link href={`/personal/alunos/${studentId}/treino/${w.id}/editar`}>
                    <Pencil className="h-4 w-4" /> Editar
                  </Link>
                </Button>
                <Button size="sm" variant="ghost" asChild>
                  <Link href={`/personal/alunos/${studentId}/treino/novo?clone=${w.id}`}>
                    <Copy className="h-4 w-4" /> Clonar
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </TabsContent>

      {/* FEEDBACKS */}
      <TabsContent value="feedbacks" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="rounded-md bg-muted px-2.5 py-1">
              <strong>{workoutLogs.length}</strong> treino{workoutLogs.length === 1 ? '' : 's'}
            </span>
            <span className="rounded-md bg-muted px-2.5 py-1">
              <strong>{last30}</strong> nos últimos 30 dias
            </span>
            {avgPse !== null && (
              <span className="rounded-md bg-muted px-2.5 py-1">
                PSE médio <strong>{avgPse}</strong>
              </span>
            )}
          </div>
          <ExportReportButton studentName={studentName} workoutLogs={workoutLogs} anamneses={anamneses} />
        </div>
        {!workoutLogs.length && <EmptyState emoji="💬" title="Nenhum feedback ainda" description="Quando o aluno concluir treinos, os feedbacks aparecem aqui." />}
        {workoutLogs.map((log) => {
          const loadEntries = Object.entries((log.loads as Record<string, { weight?: string; reps?: string }>) ?? {}).filter(
            ([, v]) => v && (v.weight || v.reps)
          );
          return (
            <Card key={log.id}>
              <CardContent className="space-y-2 p-5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium">{formatDate(log.completed_at)}</p>
                    {log.day_key && <Badge variant="secondary">Treino {log.day_key}</Badge>}
                    {log.duration_seconds > 0 && (
                      <span className="text-xs text-muted-foreground">⏱ {formatDurationLabel(log.duration_seconds)}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">PSE</span>
                    <Badge variant={log.pse >= 8 ? 'destructive' : log.pse >= 5 ? 'accent' : 'success'}>{log.pse}/10</Badge>
                  </div>
                </div>
                <Progress value={(log.pse ?? 0) * 10} className={cn(log.pse >= 8 && '[&>div]:bg-destructive')} />
                {log.comment && <p className="text-sm text-muted-foreground">"{log.comment}"</p>}
                {loadEntries.length > 0 && (
                  <div className="mt-1 space-y-0.5 border-t pt-2">
                    <p className="text-xs font-medium text-muted-foreground">Cargas registradas</p>
                    <ul className="grid gap-x-4 gap-y-0.5 text-sm sm:grid-cols-2">
                      {loadEntries.map(([exId, v]) => (
                        <li key={exId} className="flex justify-between gap-2">
                          <span className="truncate text-muted-foreground">{exerciseNameById.get(exId) ?? 'Exercício'}</span>
                          <span className="shrink-0 font-medium">
                            {v.weight ? `${v.weight}kg` : ''}
                            {v.weight && v.reps ? ' × ' : ''}
                            {v.reps ? `${v.reps}` : ''}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </TabsContent>
    </Tabs>
  );
}
