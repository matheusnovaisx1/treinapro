'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Search } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { ExerciseFormDialog } from '@/components/personal/exercise-form-dialog';
import { ExerciseGrid, type ExerciseRow } from '@/components/personal/exercise-grid';

const categories = ['Todas', 'Peito', 'Costas', 'Ombro', 'Bíceps', 'Tríceps', 'Perna', 'Glúteo', 'Core', 'Cardio'];

export function ExerciseLibrary({ exercises, currentUserId }: { exercises: ExerciseRow[]; currentUserId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Todas');

  const filtered = useMemo(() => {
    return exercises.filter((ex) => {
      const matchesQuery = !query || ex.name.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = category === 'Todas' || ex.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [exercises, query, category]);

  async function handleDelete(id: string) {
    const { error } = await supabase.from('exercises').delete().eq('id', id);
    if (error) {
      toast.error('Não foi possível excluir', { description: error.message });
      return;
    }
    toast.success('Exercício excluído');
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar exercício..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <ExerciseFormDialog />
      </div>

      <ExerciseGrid exercises={filtered} mode="manage" currentUserId={currentUserId} onDelete={handleDelete} />
    </div>
  );
}
