'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { BeforeAfterSlider } from '@/components/personal/before-after-slider';
import { formatDate } from '@/lib/utils';

type AssessmentWithImages = { id: string; images: string[]; created_at: string };

export function AssessmentComparisonCard({ assessments }: { assessments: AssessmentWithImages[] }) {
  const supabase = createClient();

  const withImages = useMemo(
    () => assessments.filter((a) => (a.images ?? []).length > 0).sort((a, b) => a.created_at.localeCompare(b.created_at)),
    [assessments]
  );

  const [beforeId, setBeforeId] = useState<string | undefined>(undefined);
  const [afterId, setAfterId] = useState<string | undefined>(undefined);
  const [urls, setUrls] = useState<{ before: string; after: string } | null>(null);

  // Padrão: primeira × última avaliação com foto.
  useEffect(() => {
    if (withImages.length >= 2) {
      setBeforeId((prev) => prev ?? withImages[0].id);
      setAfterId((prev) => prev ?? withImages[withImages.length - 1].id);
    }
  }, [withImages]);

  const before = withImages.find((a) => a.id === beforeId);
  const after = withImages.find((a) => a.id === afterId);

  useEffect(() => {
    let active = true;
    async function loadUrls() {
      if (!before || !after) return;
      const { data } = await supabase.storage
        .from('assessment-photos')
        .createSignedUrls([before.images[0], after.images[0]], 60 * 10);
      if (active && data?.[0]?.signedUrl && data?.[1]?.signedUrl) {
        setUrls({ before: data[0].signedUrl, after: data[1].signedUrl });
      }
    }
    loadUrls();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [before?.id, after?.id]);

  if (withImages.length < 2) return null;

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div>
          <CardTitle className="text-base">Comparativo de evolução</CardTitle>
          <CardDescription>Escolha duas avaliações e arraste para comparar.</CardDescription>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground">Antes</span>
            <Select value={beforeId} onValueChange={setBeforeId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {withImages.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {formatDate(a.created_at)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground">Depois</span>
            <Select value={afterId} onValueChange={setAfterId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {withImages.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {formatDate(a.created_at)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {before && after && before.id !== after.id && urls ? (
          <BeforeAfterSlider
            beforeUrl={urls.before}
            afterUrl={urls.after}
            beforeLabel={formatDate(before.created_at)}
            afterLabel={formatDate(after.created_at)}
          />
        ) : (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {before?.id === after?.id ? 'Escolha datas diferentes para comparar.' : 'Carregando fotos…'}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
