// Confete de celebração (canvas, sem dependências). Respeita quem prefere
// menos movimento. Cores da marca (laranja) + amigáveis do Duolingo.
export function fireConfetti() {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    canvas.remove();
    return;
  }

  const colors = ['#f97316', '#58CC02', '#FFC800', '#1CB0F6', '#FF4B4B'];
  const parts = Array.from({ length: 130 }, () => ({
    x: canvas.width / 2 + (Math.random() - 0.5) * 140,
    y: canvas.height * 0.34 + (Math.random() - 0.5) * 60,
    vx: (Math.random() - 0.5) * 11,
    vy: Math.random() * -9 - 4,
    size: Math.random() * 8 + 4,
    color: colors[Math.floor(Math.random() * colors.length)],
    rot: Math.random() * Math.PI,
    vr: (Math.random() - 0.5) * 0.35,
  }));

  const gravity = 0.3;
  const duration = 2400;
  const start = performance.now();

  function frame(t: number) {
    const elapsed = t - start;
    ctx!.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of parts) {
      p.vy += gravity;
      p.vx *= 0.99;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      ctx!.save();
      ctx!.translate(p.x, p.y);
      ctx!.rotate(p.rot);
      ctx!.globalAlpha = Math.max(0, 1 - elapsed / duration);
      ctx!.fillStyle = p.color;
      ctx!.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.62);
      ctx!.restore();
    }
    if (elapsed < duration) {
      requestAnimationFrame(frame);
    } else {
      canvas.remove();
    }
  }
  requestAnimationFrame(frame);
}
