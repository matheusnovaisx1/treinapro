// Gera uma imagem (PNG) do treino concluído para compartilhar no Instagram,
// GymRats, WhatsApp etc. Desenhada em canvas — roda 100% no cliente.

export type WorkoutImageData = {
  dayLabel: string;
  exerciseCount: number;
  pse: number;
  streak?: number;
  brandName?: string | null;
};

const W = 1080;
const H = 1350; // proporção 4:5 (feed e stories)
const PAD = 96;
const SANS = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

export async function buildWorkoutImageBlob(d: WorkoutImageData): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas indisponível');

  // Fundo escuro + brilho laranja no topo
  ctx.fillStyle = '#0e1626';
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(260, 260, 40, 260, 260, 980);
  glow.addColorStop(0, 'rgba(249,115,22,0.38)');
  glow.addColorStop(1, 'rgba(249,115,22,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Eyebrow
  ctx.fillStyle = '#fb8b3c';
  ctx.font = `700 30px ${SANS}`;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('TREINO CONCLUÍDO', PAD, 250);
  ctx.fillText('💪', PAD + ctx.measureText('TREINO CONCLUÍDO ').width, 250);

  // Título (dia do treino), com quebra de linha
  ctx.fillStyle = '#f4f7fb';
  const titleSize = d.dayLabel.length > 22 ? 76 : 92;
  ctx.font = `800 ${titleSize}px ${SANS}`;
  const lines = wrapText(ctx, d.dayLabel, W - PAD * 2);
  let ty = 250 + 90;
  for (const line of lines.slice(0, 3)) {
    ctx.fillText(line, PAD, ty);
    ty += titleSize + 8;
  }

  // Cartões de estatística
  const stats: { label: string; value: string }[] = [
    { label: 'exercícios', value: String(d.exerciseCount) },
    { label: 'esforço', value: `${d.pse}/10` },
  ];
  if (d.streak && d.streak > 1) stats.push({ label: 'dias seguidos', value: `🔥${d.streak}` });

  const cardY = 900;
  const gap = 28;
  const cardW = (W - PAD * 2 - gap * (stats.length - 1)) / stats.length;
  const cardH = 200;
  stats.forEach((s, i) => {
    const x = PAD + i * (cardW + gap);
    roundRect(ctx, x, cardY, cardW, cardH, 28);
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.10)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#f4f7fb';
    ctx.font = `800 64px ${SANS}`;
    ctx.textAlign = 'center';
    ctx.fillText(s.value, x + cardW / 2, cardY + 96);
    ctx.fillStyle = '#9aa6ba';
    ctx.font = `600 26px ${SANS}`;
    ctx.fillText(s.label, x + cardW / 2, cardY + 150);
    ctx.textAlign = 'left';
  });

  // Rodapé com marca
  ctx.fillStyle = '#fb8b3c';
  ctx.font = `800 40px ${SANS}`;
  ctx.fillText('🏋️', PAD, H - 96);
  ctx.fillStyle = '#f4f7fb';
  ctx.fillText(d.brandName || 'TreinaPro', PAD + 64, H - 96);

  ctx.fillStyle = '#7f8ba1';
  ctx.font = `500 26px ${SANS}`;
  ctx.textAlign = 'right';
  ctx.fillText(formatToday(), W - PAD, H - 96);
  ctx.textAlign = 'left';

  return await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob falhou'))), 'image/png')
  );
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function formatToday(): string {
  const d = new Date();
  // Alinhado à direita: precisa medir, então o chamador usa textAlign right aqui.
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
}
