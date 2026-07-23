import { cn } from '@/lib/utils';
import type { PlanProgress } from '@/lib/periodization';

// Barra de progresso amigável — mostra fase, semana X de Y e evolução do plano.
// Sem jargão: pensada para o aluno leigo entender que está evoluindo.
export function PhaseProgress({ progress, className }: { progress: PlanProgress; className?: string }) {
  const { phaseMeta, weekInPhase, weeksInPhase, overallWeek, totalWeeks, overallPercent, finished } = progress;

  return (
    <div className={cn('rounded-xl border bg-card p-4', className)}>
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-muted text-xl" aria-hidden="true">
          {phaseMeta.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {finished ? 'Plano concluído' : 'Fase atual'}
          </p>
          <p className="font-display text-lg font-bold leading-tight">
            {finished ? '🎉 Você concluiu o ciclo!' : phaseMeta.label}
          </p>
          {!finished && (
            <p className="text-sm text-muted-foreground">
              Semana {weekInPhase} de {weeksInPhase} · {phaseMeta.description}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
          <span>Progresso do plano</span>
          <span>
            Semana {overallWeek}/{totalWeeks}
          </span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent to-orange-500 transition-all"
            style={{ width: `${overallPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
