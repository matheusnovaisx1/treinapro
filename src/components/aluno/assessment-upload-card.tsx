'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Upload, ImageIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, validateImageFile } from '@/lib/utils';

type Assessment = { id: string; type: string; data: any; images: string[]; requested: boolean; created_at: string };

export function AssessmentUploadCard({ assessment, userId }: { assessment: Assessment; userId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);

  const isPending = assessment.requested && !Object.keys(assessment.data ?? {}).length && !(assessment.images ?? []).length;

  async function handleSubmit() {
    setUploading(true);
    const uploadedPaths: string[] = [];

    if (files?.length) {
      for (const file of Array.from(files)) {
        const validationError = validateImageFile(file, 10 * 1024 * 1024);
        if (validationError) {
          toast.error(`${file.name}: ${validationError}`);
          continue;
        }
        const path = `${userId}/${assessment.id}/${Date.now()}-${file.name}`;
        const { error } = await supabase.storage.from('assessment-photos').upload(path, file);
        if (!error) uploadedPaths.push(path);
      }
    }

    const data: Record<string, string> = {};
    if (weight) data.peso = `${weight} kg`;
    if (bodyFat) data.gordura = `${bodyFat}%`;

    const { error } = await supabase
      .from('assessments')
      .update({ data, images: uploadedPaths })
      .eq('id', assessment.id);

    setUploading(false);

    if (error) {
      toast.error('Não foi possível enviar', { description: error.message });
      return;
    }

    toast.success('Avaliação enviada ao seu personal');
    router.refresh();
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base capitalize">{assessment.type}</CardTitle>
        <Badge variant={isPending ? 'secondary' : 'success'}>{isPending ? 'Pendente' : 'Enviada'}</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-muted-foreground">Solicitada em {formatDate(assessment.created_at)}</p>

        {isPending ? (
          <>
            {assessment.type === 'morfologica' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Peso (kg)</Label>
                  <Input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>% de gordura</Label>
                  <Input type="number" step="0.1" value={bodyFat} onChange={(e) => setBodyFat(e.target.value)} />
                </div>
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Fotos</Label>
              <Input type="file" accept="image/*" multiple onChange={(e) => setFiles(e.target.files)} />
            </div>
            <Button variant="accent" onClick={handleSubmit} disabled={uploading}>
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Enviar avaliação
            </Button>
          </>
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ImageIcon className="h-4 w-4" /> {(assessment.images ?? []).length} foto(s) enviada(s)
          </div>
        )}
      </CardContent>
    </Card>
  );
}
