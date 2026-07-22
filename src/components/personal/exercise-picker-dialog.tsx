'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { ExerciseGrid, type ExerciseRow } from '@/components/personal/exercise-grid';

const categories = ['Todas', 'Peito', 'Costas', 'Ombro', 'Bíceps', 'Tríceps', 'Perna', 'Glúteo', 'Core', 'Cardio'];

export function ExercisePickerDialog({
  open,
  onOpenChange,
  exercises,
  onSelect,
  initialCategory,
  title = 'Adicionar exercício',
  description = 'Busque na biblioteca e adicione ao dia de treino.',
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  exercises: ExerciseRow[];
  onSelect: (exercise: ExerciseRow) => void;
  initialCategory?: string;
  title?: string;
  description?: string;
}) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(initialCategory ?? 'Todas');

  useEffect(() => {
    if (open) setCategory(initialCategory ?? 'Todas');
  }, [open, initialCategory]);

  const filtered = useMemo(() => {
    return exercises.filter((ex) => {
      const matchesQuery = !query || ex.name.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = category === 'Todas' || ex.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [exercises, query, category]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-3">
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

        <ExerciseGrid
          exercises={filtered}
          mode="picker"
          onSelect={(ex) => {
            onSelect(ex);
            onOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
