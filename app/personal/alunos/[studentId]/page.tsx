import Link from 'next/link';
import { MessageSquare, Phone, CalendarRange } from 'lucide-react';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StudentTabs } from '@/components/personal/student-tabs';
import { initials } from '@/lib/utils';
import { whatsappLink } from '@/lib/whatsapp';
import type { EvolutionPoint } from '@/components/personal/evolution-chart';

export default async function StudentProfilePage({ params }: { params: { studentId: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: student } = await supabase
    .from('students')
    .select('id, status, notes, created_at, profile:profiles!students_profile_id_fkey(full_name, email, avatar_url, phone)')
    .eq('id', params.studentId)
    .eq('personal_id', user!.id)
    .single();

  if (!student) notFound();

  const [{ data: anamneses }, { data: assessments }, { data: workouts }, { data: templates }] = await Promise.all([
    supabase.from('anamneses').select('*').eq('student_id', student.id).order('sent_at', { ascending: false }),
    supabase.from('assessments').select('*').eq('student_id', student.id).order('created_at', { ascending: false }),
    supabase.from('workouts').select('*').eq('student_id', student.id).order('created_at', { ascending: false }),
    supabase.from('anamnese_templates').select('*').or(`personal_id.eq.${user!.id},personal_id.is.null`),
  ]);

  const workoutIds = (workouts ?? []).map((w) => w.id);
  const { data: workoutLogs } = workoutIds.length
    ? await supabase.from('workout_logs').select('*').in('workout_id', workoutIds).order('completed_at', { ascending: false })
    : { data: [] as any[] };

  const evolutionData: EvolutionPoint[] = (assessments ?? [])
    .filter((a) => a.type === 'morfologica' && a.data)
    .map((a) => ({ date: a.created_at, weight: (a.data as any).peso ?? (a.data as any).weight, bodyFat: (a.data as any).gordura ?? (a.data as any).bodyFat }))
    .reverse();

  const profile = student.profile as any;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14">
            <AvatarImage src={profile?.avatar_url ?? undefined} />
            <AvatarFallback className="text-base">{initials(profile?.full_name)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-bold">{profile?.full_name ?? 'Aluno'}</h1>
              <Badge variant={student.status === 'active' ? 'success' : 'secondary'}>
                {student.status === 'active' ? 'Ativo' : student.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{profile?.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {profile?.phone && (
            <Button variant="outline" asChild>
              <a href={whatsappLink(profile.phone, `Oi ${profile.full_name?.split(' ')[0] ?? ''}! `)} target="_blank" rel="noreferrer">
                <Phone className="h-4 w-4" /> WhatsApp
              </a>
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link href={`/personal/alunos/${student.id}/plano`}>
              <CalendarRange className="h-4 w-4" /> Periodização
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/personal/alunos/${student.id}/chat`}>
              <MessageSquare className="h-4 w-4" /> Chat
            </Link>
          </Button>
        </div>
      </div>

      <StudentTabs
        studentId={student.id}
        studentName={profile?.full_name ?? 'Aluno'}
        studentEmail={profile?.email}
        notes={student.notes}
        anamneses={anamneses ?? []}
        assessments={assessments ?? []}
        workouts={workouts ?? []}
        workoutLogs={workoutLogs ?? []}
        templates={templates ?? []}
        evolutionData={evolutionData}
      />
    </div>
  );
}
