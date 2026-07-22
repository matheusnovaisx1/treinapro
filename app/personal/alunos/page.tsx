import { createClient } from '@/lib/supabase/server';
import { InviteStudentDialog } from '@/components/personal/invite-student-dialog';
import { StudentsList } from '@/components/personal/students-list';

export default async function AlunosPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user!.id).single();

  const { data: students } = await supabase
    .from('students')
    .select('id, status, created_at, profile:profiles!students_profile_id_fkey(full_name, email, avatar_url)')
    .eq('personal_id', user!.id)
    .order('created_at', { ascending: false });

  const studentIds = (students ?? []).map((s) => s.id);
  const { data: logs } = studentIds.length
    ? await supabase.from('workout_logs').select('student_id, completed_at').in('student_id', studentIds).order('completed_at', { ascending: false })
    : { data: [] as any[] };

  const lastWorkoutByStudent = new Map<string, string>();
  (logs ?? []).forEach((log: any) => {
    if (!lastWorkoutByStudent.has(log.student_id)) lastWorkoutByStudent.set(log.student_id, log.completed_at);
  });

  const studentsWithActivity = (students ?? []).map((s) => ({ ...s, lastWorkoutAt: lastWorkoutByStudent.get(s.id) ?? null }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Alunos</h1>
          <p className="text-sm text-muted-foreground">Gerencie sua carteira de alunos.</p>
        </div>
        <InviteStudentDialog currentPlan={profile?.plan} />
      </div>

      <StudentsList students={studentsWithActivity as any} />
    </div>
  );
}
