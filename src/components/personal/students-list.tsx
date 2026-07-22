'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { initials, formatDate, daysSince } from '@/lib/utils';

type StudentRow = {
  id: string;
  status: string;
  created_at: string;
  lastWorkoutAt: string | null;
  profile: { full_name: string | null; email: string; avatar_url: string | null } | null;
};

const INACTIVITY_THRESHOLD_DAYS = 4;

export function StudentsList({ students }: { students: StudentRow[] }) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchesQuery =
        !query ||
        s.profile?.full_name?.toLowerCase().includes(query.toLowerCase()) ||
        s.profile?.email?.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [students, query, statusFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar por nome ou e-mail..." className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="inactive">Inativos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="divide-y p-0">
          {!filtered.length && <p className="p-6 text-center text-sm text-muted-foreground">Nenhum aluno encontrado.</p>}
          {filtered.map((s) => {
            const inactiveDays = daysSince(s.lastWorkoutAt);
            const isInactive = inactiveDays === null || inactiveDays >= INACTIVITY_THRESHOLD_DAYS;
            return (
              <Link key={s.id} href={`/personal/alunos/${s.id}`} className="flex items-center justify-between px-5 py-4 hover:bg-muted">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={s.profile?.avatar_url ?? undefined} />
                    <AvatarFallback>{initials(s.profile?.full_name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{s.profile?.full_name ?? 'Aluno'}</p>
                    <p className="text-xs text-muted-foreground">{s.profile?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {s.status === 'active' && isInactive && (
                    <Badge variant="destructive" className="gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {inactiveDays === null ? 'Nunca treinou' : `Sem treinar há ${inactiveDays}d`}
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">Desde {formatDate(s.created_at)}</span>
                  <Badge variant={s.status === 'active' ? 'success' : 'secondary'}>{s.status === 'active' ? 'Ativo' : s.status}</Badge>
                </div>
              </Link>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
