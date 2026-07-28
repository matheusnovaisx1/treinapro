'use client';

import { useState } from 'react';
import { FileDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { formatDurationLabel } from '@/lib/workout-format';

type WorkoutLog = {
  completed_at: string;
  pse: number | null;
  comment: string | null;
  day_key?: string | null;
  duration_seconds?: number | null;
};
type Anamnese = { status: string; completed_at: string | null };
type LoadRecord = { name: string; weight: number };

export function ExportReportButton({
  studentName,
  workoutLogs,
  anamneses,
  records = [],
}: {
  studentName: string;
  workoutLogs: WorkoutLog[];
  anamneses: Anamnese[];
  records?: LoadRecord[];
}) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      const marginX = 14;
      let y = 20;

      const heading = (text: string) => {
        if (y > 275) {
          doc.addPage();
          y = 20;
        }
        doc.setFontSize(13);
        doc.setTextColor(0);
        doc.text(text, marginX, y);
        y += 7;
        doc.setFontSize(10);
      };
      const line = (text: string, muted = false) => {
        if (y > 285) {
          doc.addPage();
          y = 20;
        }
        doc.setTextColor(muted ? 120 : 0);
        doc.text(text, marginX, y);
        y += 6;
      };

      doc.setFontSize(18);
      doc.text('TreinaPro — Relatório do aluno', marginX, y);
      y += 10;
      doc.setFontSize(12);
      doc.text(studentName, marginX, y);
      y += 6;
      doc.setFontSize(9);
      doc.setTextColor(120);
      doc.text(`Gerado em ${formatDate(new Date())}`, marginX, y);
      doc.setTextColor(0);
      y += 12;

      // Métricas
      const totalTreinos = workoutLogs.length;
      const pseValues = workoutLogs.map((l) => l.pse).filter((v): v is number => v != null);
      const avgPse = pseValues.length ? (pseValues.reduce((a, b) => a + b, 0) / pseValues.length).toFixed(1) : '—';
      const now = Date.now();
      const last30 = workoutLogs.filter((l) => now - new Date(l.completed_at).getTime() <= 30 * 864e5).length;
      const totalSeconds = workoutLogs.reduce((sum, l) => sum + (l.duration_seconds ?? 0), 0);
      const anamneseStatus = anamneses.some((a) => a.status === 'completed') ? 'Respondida' : 'Pendente';

      heading('Resumo');
      line(`Treinos concluídos: ${totalTreinos}`);
      line(`Nos últimos 30 dias: ${last30}`);
      line(`PSE médio: ${avgPse}`);
      if (totalSeconds > 0) line(`Tempo total treinado: ${formatDurationLabel(totalSeconds)}`);
      line(`Anamnese: ${anamneseStatus}`);
      y += 6;

      // Recordes de carga
      if (records.length) {
        heading('Recordes de carga');
        records.slice(0, 30).forEach((r) => line(`${r.name}: ${r.weight} kg`));
        y += 6;
      }

      // Histórico de treinos
      heading('Histórico de treinos');
      if (!workoutLogs.length) {
        line('Nenhum treino registrado neste período.', true);
      }
      workoutLogs.slice(0, 60).forEach((log) => {
        const parts = [formatDate(log.completed_at)];
        if (log.day_key) parts.push(`Treino ${log.day_key}`);
        parts.push(`PSE ${log.pse ?? '—'}/10`);
        if (log.duration_seconds && log.duration_seconds > 0) parts.push(formatDurationLabel(log.duration_seconds));
        let text = parts.join('  ·  ');
        if (log.comment) text += `  ·  "${log.comment}"`;
        line(text);
      });

      doc.save(`relatorio-${studentName.toLowerCase().replace(/\s+/g, '-')}.pdf`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport} disabled={loading}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
      Baixar relatório PDF
    </Button>
  );
}
