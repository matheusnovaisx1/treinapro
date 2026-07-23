'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { CalendarDays, Sparkles, Target } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlanTimeline } from '@/components/periodization/plan-timeline';
import {
  generatePlan,
  GOAL_LABELS,
  EXPERIENCE_LABELS,
  type TrainingGoal,
  type ExperienceLevel,
} from '@/lib/periodization';

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function PlanBuilder({ studentId, studentName }: { studentId: string; studentName: string }) {
  const router = useRouter();
  const supabase = createClient();

  const [goal, setGoal] = useState<TrainingGoal>('hipertrofia');
  const [experience, setExperience] = useState<ExperienceLevel>('iniciante');
  const [frequency, setFrequency] = useState(3);
  const [sessionMinutes, setSessionMinutes] = useState<number | ''>(60);
  const [restrictions, setRestrictions] = useState('');
  const [startDate, setStartDate] = useState(todayISO());
  const [saving, setSaving] = useState(false);

  // O preview é recalculado a cada mudança nas respostas.
  const plan = useMemo(
    () =>
      generatePlan({
        goal,
        experience,
        weeklyFrequency: frequency,
        sessionMinutes: sessionMinutes === '' ? null : sessionMinutes,
        restrictions: restrictions || null,
        startDate: new Date(startDate + 'T00:00:00'),
      }),
    [goal, experience, frequency, sessionMinutes, restrictions, startDate]
  );

  async function handleCreate() {
    setSaving(true);
    const { error } = await supabase.rpc('create_training_plan', {
      p_student_id: studentId,
      p_name: `Plano — ${GOAL_LABELS[goal]}`,
      p_goal: goal,
      p_experience: experience,
      p_weekly_frequency: frequency,
      p_session_minutes: sessionMinutes === '' ? null : sessionMinutes,
      p_restrictions: restrictions || null,
      p_start_date: plan.startDate,
      p_end_date: plan.endDate,
      p_mesocycles: plan.mesocycles.map((m) => ({
        ord: m.ord,
        focus: m.focus,
        planned_weeks: m.plannedWeeks,
        start_date: m.startDate,
        end_date: m.endDate,
        target_volume: m.targetVolume,
        target_intensity: m.targetIntensity,
        microcycles: m.microcycles.map((w) => ({
          week_number: w.weekNumber,
          start_date: w.startDate,
          end_date: w.endDate,
          volume_multiplier: w.volumeMultiplier,
          intensity_multiplier: w.intensityMultiplier,
        })),
      })),
    });
    setSaving(false);

    if (error) {
      toast.error('Não foi possível criar o plano', { description: error.message });
      return;
    }
    toast.success('Plano de periodização criado e ativado!');
    router.push(`/personal/alunos/${studentId}/plano`);
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Coluna 1: perguntas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-accent" /> Sobre o treino de {studentName.split(' ')[0]}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Objetivo principal</Label>
            <Select value={goal} onValueChange={(v) => setGoal(v as TrainingGoal)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(GOAL_LABELS) as TrainingGoal[]).map((g) => (
                  <SelectItem key={g} value={g}>
                    {GOAL_LABELS[g]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Nível de experiência</Label>
            <Select value={experience} onValueChange={(v) => setExperience(v as ExperienceLevel)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(EXPERIENCE_LABELS) as ExperienceLevel[]).map((e) => (
                  <SelectItem key={e} value={e}>
                    {EXPERIENCE_LABELS[e]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Treinos por semana</Label>
              <Select value={String(frequency)} onValueChange={(v) => setFrequency(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}x
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Minutos por sessão</Label>
              <Input
                type="number"
                min={20}
                max={180}
                value={sessionMinutes}
                onChange={(e) => setSessionMinutes(e.target.value === '' ? '' : Number(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Lesões, dores ou restrições (opcional)</Label>
            <Input
              placeholder="Ex.: dor no ombro direito, hérnia lombar…"
              value={restrictions}
              onChange={(e) => setRestrictions(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Início do plano</Label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* Coluna 2: preview do macrociclo gerado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" /> Plano sugerido
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            {plan.totalWeeks} semanas · {plan.mesocycles.length} fases
          </div>

          <PlanTimeline
            phases={plan.mesocycles.map((m) => ({
              ord: m.ord,
              focus: m.focus,
              plannedWeeks: m.plannedWeeks,
              startDate: m.startDate,
              endDate: m.endDate,
            }))}
          />

          <p className="text-xs text-muted-foreground">
            Este é um ponto de partida gerado automaticamente. Você continua montando as fichas de cada
            fase do jeito que quiser — o plano só organiza a progressão ao longo do tempo.
          </p>

          <Button variant="accent" className="w-full" onClick={handleCreate} disabled={saving}>
            {saving ? 'Criando…' : 'Criar e ativar plano'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
