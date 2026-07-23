import { PHASE_META, type MesocycleFocus } from '@/lib/periodization';
import { cn, formatDate } from '@/lib/utils';

export type TimelinePhase = {
  ord: number;
  focus: MesocycleFocus;
  plannedWeeks: number;
  startDate: string;
  endDate: string;
};

// Visual das fases do macrociclo — leigo-friendly. Destaca a fase atual.
export function PlanTimeline({
  phases,
  currentOrd,
  className,
}: {
  phases: TimelinePhase[];
  currentOrd?: number;
  className?: string;
}) {
  return (
    <ol className={cn('space-y-2', className)}>
      {phases.map((phase) => {
        const meta = PHASE_META[phase.focus];
        const active = phase.ord === currentOrd;
        return (
          <li
            key={phase.ord}
            className={cn(
              'flex items-center gap-3 rounded-lg border p-3 transition-colors',
              active ? 'border-accent bg-accent/5 shadow-sm' : 'border-border bg-card'
            )}
          >
            <div
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-lg',
                active ? 'bg-accent/15' : 'bg-muted'
              )}
              aria-hidden="true"
            >
              {meta.emoji}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-display font-semibold">{meta.label}</span>
                <span className="text-xs text-muted-foreground">
                  {phase.plannedWeeks} {phase.plannedWeeks === 1 ? 'semana' : 'semanas'}
                </span>
                {active && (
                  <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground">
                    Agora
                  </span>
                )}
              </div>
              <p className="truncate text-xs text-muted-foreground">{meta.description}</p>
            </div>
            <div className="hidden shrink-0 text-right text-xs text-muted-foreground sm:block">
              {formatDate(phase.startDate)}
              <br />
              {formatDate(phase.endDate)}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
