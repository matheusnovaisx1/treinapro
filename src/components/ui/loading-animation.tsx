// Animação de carregamento com tema fitness: um halter "levantando".
// Renderizável em Server Components (usa <style> inline, sem hooks).
export function LoadingAnimation({ label = 'Carregando…' }: { label?: string }) {
  return (
    <div className="flex min-h-[55vh] flex-col items-center justify-center gap-5">
      <style>{`
        @keyframes tp-lift {
          0%, 100% { transform: translateY(4px) rotate(-10deg); }
          50%      { transform: translateY(-14px) rotate(10deg); }
        }
        @keyframes tp-shadow {
          0%, 100% { transform: scaleX(1); opacity: .30; }
          50%      { transform: scaleX(.62); opacity: .12; }
        }
        .tp-lift   { animation: tp-lift 0.85s ease-in-out infinite; transform-origin: 50% 50%; }
        .tp-shadow { animation: tp-shadow 0.85s ease-in-out infinite; transform-origin: 50% 50%; }
      `}</style>

      <div className="flex flex-col items-center">
        <svg width="84" height="72" viewBox="0 0 84 72" fill="none" aria-hidden="true">
          <g className="tp-lift">
            {/* barra */}
            <rect x="26" y="30" width="32" height="8" rx="4" className="fill-foreground/70" />
            {/* anilhas esquerda */}
            <rect x="14" y="20" width="10" height="28" rx="4" className="fill-accent" />
            <rect x="6" y="25" width="8" height="18" rx="4" className="fill-accent/80" />
            {/* anilhas direita */}
            <rect x="60" y="20" width="10" height="28" rx="4" className="fill-accent" />
            <rect x="70" y="25" width="8" height="18" rx="4" className="fill-accent/80" />
          </g>
          {/* sombra no chão */}
          <ellipse cx="42" cy="66" rx="24" ry="4" className="tp-shadow fill-foreground" />
        </svg>
      </div>

      <p className="animate-pulse text-sm font-medium text-muted-foreground">{label}</p>
    </div>
  );
}
