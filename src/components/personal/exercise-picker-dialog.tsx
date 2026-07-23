'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ExerciseGrid, type ExerciseRow } from '@/components/personal/exercise-grid';

const categories = ['Todas', 'Peito', 'Costas', 'Ombro', 'Bíceps', 'Tríceps', 'Perna', 'Glúteo', 'Core', 'Cardio'];

export function ExercisePickerDialog({
  open,
  onOpenChange,
  exercises,
  onSelect,
  onSelectMany,
  multiple = false,
  initialCategory,
  title = 'Adicionar exercício',
  description = 'Busque na biblioteca e adicione ao dia de treino.',
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  exercises: ExerciseRow[];
  onSelect?: (exercise: ExerciseRow) => void;
  onSelectMany?: (exercises: ExerciseRow[]) => void;
  multiple?: boolean;
  initialCategory?: string;
  title?: string;
  description?: string;
}) {
  // Filtro persiste entre aberturas (só é forçado quando initialCategory muda —
  // usado na substituição, que abre já filtrada pelo grupo do exercício).
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(initialCategory ?? 'Todas');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open && initialCategory) setCategory(initialCategory);
  }, [open, initialCategory]);

  // Limpa a seleção ao abrir (mas mantém o filtro).
  useEffect(() => {
    if (open) setSelectedIds(new Set());
  }, [open]);

  const filtered = useMemo(() => {
    return exercises.filter((ex) => {
      const matchesQuery = !query || ex.name.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = category === 'Todas' || ex.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [exercises, query, category]);

  function toggle(ex: ExerciseRow) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(ex.id)) next.delete(ex.id);
      else next.add(ex.id);
      return next;
    });
  }

  function handleAddSelected() {
    const chosen = exercises.filter((ex) => selectedIds.has(ex.id));
    if (chosen.length) onSelectMany?.(chosen);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] max-w-3xl flex-col overflow-hidden">
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

        <div className="-mx-1 flex-1 overflow-y-auto px-1">
          {multiple ? (
            <ExerciseGrid exercises={filtered} mode="picker" selectedIds={selectedIds} onToggle={toggle} />
          ) : (
            <ExerciseGrid
              exercises={filtered}
              mode="picker"
              onSelect={(ex) => {
                onSelect?.(ex);
                onOpenChange(false);
              }}
            />
          )}
        </div>

        {multiple && (
          <div className="flex items-center justify-between gap-3 border-t pt-3">
            <span className="text-sm text-muted-foreground">
              {selectedIds.size} selecionado{selectedIds.size === 1 ? '' : 's'}
            </span>
            <Button variant="accent" onClick={handleAddSelected} disabled={selectedIds.size === 0}>
              <Plus className="h-4 w-4" /> Adicionar {selectedIds.size > 0 ? selectedIds.size : ''} ao treino
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
