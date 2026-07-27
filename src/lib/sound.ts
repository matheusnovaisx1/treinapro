// Som de sucesso sintetizado (Web Audio) — sem arquivo de áudio. Um arpejo
// curto e alegre (C-E-G-C). Respeita a preferência 'tp_sound' (localStorage).

export function soundEnabled(): boolean {
  try {
    return localStorage.getItem('tp_sound') !== 'off';
  } catch {
    return true;
  }
}

export function playSuccessChime() {
  if (typeof window === 'undefined' || !soundEnabled()) return;
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const t = now + i * 0.09;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.16, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.4);
    });
    setTimeout(() => ctx.close().catch(() => {}), 900);
  } catch {
    /* áudio indisponível: ignora */
  }
}
