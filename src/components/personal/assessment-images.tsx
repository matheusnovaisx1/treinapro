'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

export function AssessmentImages({ paths }: { paths: string[] }) {
  const supabase = createClient();
  const [urls, setUrls] = useState<string[]>([]);

  useEffect(() => {
    let active = true;
    async function loadUrls() {
      if (!paths.length) return;
      const { data } = await supabase.storage.from('assessment-photos').createSignedUrls(paths, 60 * 10);
      if (active && data) setUrls(data.map((d) => d.signedUrl).filter(Boolean) as string[]);
    }
    loadUrls();
    return () => {
      active = false;
    };
  }, [paths, supabase]);

  if (!paths.length) return <p className="text-sm text-muted-foreground">Nenhuma foto enviada.</p>;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {urls.map((url, i) => (
        <div key={i} className="relative aspect-square overflow-hidden rounded-md border bg-muted">
          <Image src={url} alt={`Avaliação ${i + 1}`} fill sizes="200px" className="object-cover" />
        </div>
      ))}
    </div>
  );
}
