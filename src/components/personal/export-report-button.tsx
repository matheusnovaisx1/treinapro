'use client';

import { useState } from 'react';
import { FileDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';

type WorkoutLog = { completed_at: string; pse: number | null; comment: string | null };
type Anamnese = { status: string; completed_at: string | null };

export function ExportReportButton({
  studentName,
  workoutLogs,
  anamneses,
}: {
  studentName: string;
  workoutLogs: WorkoutLog[];
  anamneses: Anamnese[];
}) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      const marginX = 14;
      let y = 20;

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

      // Resumo
      const totalTreinos = workoutLogs.length;
      const pseValues = workoutLogs.map((l) => l.pse).filter((v): v is number => v != null);
      const avgPse = pseValues.length ? (pseValues.reduce((a, b) => a + b, 0) / pseValues.length).toFixed(1) : '—';
      const anamneseStatus = anamneses.some((a) => a.status === 'completed') ? 'Respondida' : 'Pendente';

      doc.setFontSize(13);
      doc.text('Resumo', marginX, y);
      y += 7;
      doc.setFontSize(10);
      doc.text(`Treinos concluídos no período: ${totalTreinos}`, marginX, y);
      y += 6;
      doc.text(`PSE médio: ${avgPse}`, marginX, y);
      y += 6;
      doc.text(`Anamnese: ${anamneseStatus}`, marginX, y);
      y += 12;

      // Histórico de treinos
      doc.setFontSize(13);
      doc.text('Histórico de treinos', marginX, y);
      y += 8;
      doc.setFontSize(10);

      if (!workoutLogs.length) {
        doc.setTextColor(120);
        doc.text('Nenhum treino registrado neste período.', marginX, y);
        doc.setTextColor(0);
      }

      workoutLogs.slice(0, 40).forEach((log) => {
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
        const line = `${formatDate(log.completed_at)}  ·  PSE ${log.pse ?? '—'}/10${log.comment ? `  ·  "${log.comment}"` : ''}`;
        doc.text(line, marginX, y);
        y += 6;
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
