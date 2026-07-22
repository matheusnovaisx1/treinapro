'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BeforeAfterSlider } from '@/components/personal/before-after-slider';
import { formatDate } from '@/lib/utils';

type AssessmentWithImages = { id: string; images: string[]; created_at: string };

export function AssessmentComparisonCard({ assessments }: { assessments: AssessmentWithImages[] }) {
  const supabase = createClient();
  const [urls, setUrls] = useState<{ before: string; after: string } | null>(null);

  const withImages = assessments.filter((a) => (a.images ?? []).length > 0).sort((a, b) => a.created_at.localeCompare(b.created_at));
  const first = withImages[0];
  const last = withImages[withImages.length - 1];

  useEffect(() => {
    let active = true;
    async function loadUrls() {
      if (!first || !last || first.id === last.id) return;
      const { data } = await supabase.storage.from('assessment-photos').createSignedUrls([first.images[0], last.images[0]], 60 * 10);
      if (active && data?.[0]?.signedUrl && data?.[1]?.signedUrl) {
        setUrls({ before: data[0].signedUrl, after: data[1].signedUrl });
      }
    }
    loadUrls();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [first?.id, last?.id]);

  if (!first || !last || first.id === last.id || !urls) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Comparativo de evolução</CardTitle>
        <CardDescription>
          Arraste para comparar {formatDate(first.created_at)} → {formatDate(last.created_at)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <BeforeAfterSlider beforeUrl={urls.before} afterUrl={urls.after} beforeLabel={formatDate(first.created_at)} afterLabel={formatDate(last.created_at)} />
      </CardContent>
    </Card>
  );
}
