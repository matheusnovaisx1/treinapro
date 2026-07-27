// Mascote do TreinaPro: um halter com carinha (amigável, estilo "sticker").
// Usa a cor de destaque do tema (laranja). Ideal para empty states.
export function DumbbellMascot({ size = 96, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      className={className}
      role="img"
      aria-label="Mascote TreinaPro"
    >
      {/* halo suave */}
      <circle cx="50" cy="50" r="48" fill="hsl(var(--accent) / 0.12)" />

      {/* anilhas externas */}
      <rect x="10" y="38" width="8" height="24" rx="4" fill="hsl(var(--accent) / 0.75)" />
      <rect x="82" y="38" width="8" height="24" rx="4" fill="hsl(var(--accent) / 0.75)" />
      {/* anilhas internas */}
      <rect x="19" y="31" width="11" height="38" rx="5" fill="hsl(var(--accent))" />
      <rect x="70" y="31" width="11" height="38" rx="5" fill="hsl(var(--accent))" />
      {/* conectores */}
      <rect x="30" y="45" width="8" height="10" rx="3" fill="hsl(var(--accent))" />
      <rect x="62" y="45" width="8" height="10" rx="3" fill="hsl(var(--accent))" />

      {/* corpo central (onde fica a carinha) */}
      <rect x="36" y="33" width="28" height="34" rx="13" fill="hsl(var(--accent))" />

      {/* olhos */}
      <circle cx="45" cy="47" r="4.2" fill="#ffffff" />
      <circle cx="55" cy="47" r="4.2" fill="#ffffff" />
      <circle cx="45.8" cy="48" r="2" fill="#20140c" />
      <circle cx="55.8" cy="48" r="2" fill="#20140c" />

      {/* sorriso */}
      <path d="M44 55 Q50 61 56 55" stroke="#20140c" strokeWidth="3" strokeLinecap="round" fill="none" />
    </svg>
  );
}
