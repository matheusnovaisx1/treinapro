// Tipos gerados manualmente a partir de supabase/schema.sql.
// Para manter 100% sincronizado no futuro, rode:
//   npx supabase gen types typescript --project-id SEU_PROJECT_ID > src/lib/supabase/database.types.ts
//
// Nota: cada tabela precisa do campo `Relationships` (mesmo vazio) e o schema
// precisa de `Views`/`Functions`/`Enums`/`CompositeTypes` para bater com o tipo
// genérico `GenericSchema` que o @supabase/supabase-js espera. Sem isso, o
// TypeScript não consegue casar `Database` com o client e todos os métodos
// (`insert`, `update`, `select`...) silenciosamente caem para `never`.

export type UserRole = 'personal' | 'aluno';
export type PlanType = 'free' | 'pro' | 'premium';
export type InviteStatus = 'pending' | 'accepted' | 'expired';
export type AnamneseStatus = 'pending' | 'completed';
// Periodização (ver migration 008)
export type TrainingGoal = 'emagrecimento' | 'hipertrofia' | 'forca' | 'condicionamento';
export type ExperienceLevel = 'iniciante' | 'intermediario' | 'avancado';
export type CycleStatus = 'draft' | 'active' | 'completed' | 'paused';
export type MesocycleFocus = 'adaptacao' | 'hipertrofia' | 'forca' | 'deload';
export type MicrocycleStatus = 'upcoming' | 'current' | 'done' | 'skipped';

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          full_name: string | null;
          email: string;
          avatar_url: string | null;
          personal_id: string | null;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          plan: PlanType;
          plan_price: number;
          phone: string | null;
          bio: string | null;
          brand_color: string | null;
          brand_logo_url: string | null;
          public_slug: string | null;
          is_public_page_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['profiles']['Row']> & { id: string; email: string };
        Update: Partial<Database['public']['Tables']['profiles']['Row']>;
        Relationships: [];
      };
      invites: {
        Row: {
          id: string;
          personal_id: string;
          token: string;
          email: string | null;
          status: InviteStatus;
          expires_at: string;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['invites']['Row']> & { personal_id: string; token: string };
        Update: Partial<Database['public']['Tables']['invites']['Row']>;
        Relationships: [];
      };
      students: {
        Row: {
          id: string;
          personal_id: string;
          profile_id: string;
          status: string;
          notes: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['students']['Row']> & { personal_id: string; profile_id: string };
        Update: Partial<Database['public']['Tables']['students']['Row']>;
        Relationships: [];
      };
      anamnese_templates: {
        Row: {
          id: string;
          personal_id: string | null;
          name: string;
          questions: unknown;
          is_default: boolean;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['anamnese_templates']['Row']> & { name: string };
        Update: Partial<Database['public']['Tables']['anamnese_templates']['Row']>;
        Relationships: [];
      };
      anamneses: {
        Row: {
          id: string;
          student_id: string;
          template_id: string | null;
          questions: unknown;
          answers: unknown;
          status: AnamneseStatus;
          sent_at: string;
          completed_at: string | null;
        };
        Insert: Partial<Database['public']['Tables']['anamneses']['Row']> & { student_id: string };
        Update: Partial<Database['public']['Tables']['anamneses']['Row']>;
        Relationships: [];
      };
      assessments: {
        Row: {
          id: string;
          student_id: string;
          type: string;
          data: unknown;
          images: string[];
          requested: boolean;
          created_by: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['assessments']['Row']> & { student_id: string; type: string };
        Update: Partial<Database['public']['Tables']['assessments']['Row']>;
        Relationships: [];
      };
      exercises: {
        Row: {
          id: string;
          name: string;
          video_url: string | null;
          category: string | null;
          muscle_group: string | null;
          equipment: string | null;
          instructions: string | null;
          is_public: boolean;
          created_by: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['exercises']['Row']> & { name: string };
        Update: Partial<Database['public']['Tables']['exercises']['Row']>;
        Relationships: [];
      };
      workouts: {
        Row: {
          id: string;
          personal_id: string;
          student_id: string;
          name: string;
          start_date: string | null;
          end_date: string | null;
          days: unknown;
          is_extra: boolean;
          is_active: boolean;
          microcycle_id: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['workouts']['Row']> & { personal_id: string; student_id: string; name: string };
        Update: Partial<Database['public']['Tables']['workouts']['Row']>;
        Relationships: [];
      };
      workout_logs: {
        Row: {
          id: string;
          workout_id: string;
          student_id: string;
          day_key: string | null;
          completed_at: string;
          pse: number | null;
          comment: string | null;
          loads: unknown;
        };
        Insert: Partial<Database['public']['Tables']['workout_logs']['Row']> & { workout_id: string; student_id: string };
        Update: Partial<Database['public']['Tables']['workout_logs']['Row']>;
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          sender_id: string;
          receiver_id: string;
          text: string;
          read_at: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['messages']['Row']> & { sender_id: string; receiver_id: string; text: string };
        Update: Partial<Database['public']['Tables']['messages']['Row']>;
        Relationships: [];
      };
      training_plans: {
        Row: {
          id: string;
          personal_id: string;
          student_id: string;
          name: string;
          goal: TrainingGoal;
          experience: ExperienceLevel;
          weekly_frequency: number;
          session_minutes: number | null;
          restrictions: string | null;
          start_date: string;
          end_date: string | null;
          status: CycleStatus;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['training_plans']['Row']> & {
          personal_id: string;
          student_id: string;
          goal: TrainingGoal;
          experience: ExperienceLevel;
          start_date: string;
        };
        Update: Partial<Database['public']['Tables']['training_plans']['Row']>;
        Relationships: [];
      };
      mesocycles: {
        Row: {
          id: string;
          plan_id: string;
          ord: number;
          focus: MesocycleFocus;
          planned_weeks: number;
          start_date: string;
          end_date: string;
          status: CycleStatus;
          target_volume: number;
          target_intensity: number;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['mesocycles']['Row']> & {
          plan_id: string;
          ord: number;
          focus: MesocycleFocus;
          start_date: string;
          end_date: string;
        };
        Update: Partial<Database['public']['Tables']['mesocycles']['Row']>;
        Relationships: [];
      };
      microcycles: {
        Row: {
          id: string;
          mesocycle_id: string;
          week_number: number;
          start_date: string;
          end_date: string;
          status: MicrocycleStatus;
          volume_multiplier: number;
          intensity_multiplier: number;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['microcycles']['Row']> & {
          mesocycle_id: string;
          week_number: number;
          start_date: string;
          end_date: string;
        };
        Update: Partial<Database['public']['Tables']['microcycles']['Row']>;
        Relationships: [];
      };
      challenges: {
        Row: {
          id: string;
          personal_id: string;
          name: string;
          description: string | null;
          start_date: string;
          end_date: string;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['challenges']['Row']> & {
          personal_id: string;
          name: string;
          start_date: string;
          end_date: string;
        };
        Update: Partial<Database['public']['Tables']['challenges']['Row']>;
        Relationships: [];
      };
      challenge_participants: {
        Row: {
          id: string;
          challenge_id: string;
          student_id: string;
          joined_at: string;
        };
        Insert: Partial<Database['public']['Tables']['challenge_participants']['Row']> & {
          challenge_id: string;
          student_id: string;
        };
        Update: Partial<Database['public']['Tables']['challenge_participants']['Row']>;
        Relationships: [];
      };
      workout_templates: {
        Row: {
          id: string;
          personal_id: string;
          name: string;
          days: unknown;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['workout_templates']['Row']> & {
          personal_id: string;
          name: string;
        };
        Update: Partial<Database['public']['Tables']['workout_templates']['Row']>;
        Relationships: [];
      };
      push_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          endpoint: string;
          p256dh: string;
          auth: string;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['push_subscriptions']['Row']> & {
          user_id: string;
          endpoint: string;
          p256dh: string;
          auth: string;
        };
        Update: Partial<Database['public']['Tables']['push_subscriptions']['Row']>;
        Relationships: [];
      };
    };
    Views: {
      public_personal_profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          phone: string | null;
          brand_color: string | null;
          brand_logo_url: string | null;
          public_slug: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      create_training_plan: {
        Args: {
          p_student_id: string;
          p_name: string;
          p_goal: TrainingGoal;
          p_experience: ExperienceLevel;
          p_weekly_frequency: number;
          p_session_minutes: number | null;
          p_restrictions: string | null;
          p_start_date: string;
          p_end_date: string | null;
          p_mesocycles: unknown;
        };
        Returns: string;
      };
      create_challenge: {
        Args: {
          p_name: string;
          p_description: string | null;
          p_start: string;
          p_end: string;
        };
        Returns: string;
      };
      challenge_leaderboard: {
        Args: { p_challenge_id: string };
        Returns: {
          student_id: string;
          full_name: string | null;
          avatar_url: string | null;
          score: number;
          place: number;
        }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
