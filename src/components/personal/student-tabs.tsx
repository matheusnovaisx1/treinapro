'use client';

import Link from 'next/link';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dumbbell, Plus, Copy } from 'lucide-react';
import { StudentNotes } from '@/components/personal/student-notes';
import { EvolutionChart, type EvolutionPoint } from '@/components/personal/evolution-chart';
import { SendAnamneseDialog } from '@/components/personal/send-anamnese-dialog';
import { RequestAssessmentDialog } from '@/components/personal/request-assessment-dialog';
import { AssessmentImages } from '@/components/personal/assessment-images';
import { AssessmentComparisonCard } from '@/components/personal/assessment-comparison-card';
import { ExportReportButton } from '@/components/personal/export-report-button';
import { formatDate, cn } from '@/lib/utils';

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
  return (
    <Tabs defaultValue="dados">
      <TabsList>
        <TabsTrigger value="dados">Dados</TabsTrigger>
        <TabsTrigger value="anamnese">Anamnese</TabsTrigger>
        <TabsTrigger value="avaliacoes">Avaliações</TabsTrigger>
        <TabsTrigger value="treinos">Treinos</TabsTrigger>
        <TabsTrigger value="feedbacks">Feedbacks</TabsTrigger>
      </TabsList>

      {/* DADOS */}
      <TabsContent value="dados" className="space-y-6">
        <EvolutionChart data={evolutionData} />
        <StudentNotes studentId={studentId} initialNotes={notes} />
      </TabsContent>

      {/* ANAMNESE */}
      <TabsContent value="anamnese" className="space-y-4">
        <div className="flex justify-end">
          <SendAnamneseDialog studentId={studentId} templates={templates} />
        </div>
        {!anamneses.length && (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">Nenhuma anamnese enviada ainda.</CardContent>
          </Card>
        )}
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
        {!assessments.length && (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">Nenhuma avaliação registrada.</CardContent>
          </Card>
        )}
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
        {!workouts.length && (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">Nenhum treino criado ainda.</CardContent>
          </Card>
        )}
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
        <div className="flex justify-end">
          <ExportReportButton studentName={studentName} workoutLogs={workoutLogs} anamneses={anamneses} />
        </div>
        {!workoutLogs.length && (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">Nenhum feedback registrado ainda.</CardContent>
          </Card>
        )}
        {workoutLogs.map((log) => (
          <Card key={log.id}>
            <CardContent className="space-y-2 p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{formatDate(log.completed_at)}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">PSE</span>
                  <Badge variant={log.pse >= 8 ? 'destructive' : log.pse >= 5 ? 'accent' : 'success'}>{log.pse}/10</Badge>
                </div>
              </div>
              <Progress value={(log.pse ?? 0) * 10} className={cn(log.pse >= 8 && '[&>div]:bg-destructive')} />
              {log.comment && <p className="text-sm text-muted-foreground">"{log.comment}"</p>}
            </CardContent>
          </Card>
        ))}
      </TabsContent>
    </Tabs>
  );
}
