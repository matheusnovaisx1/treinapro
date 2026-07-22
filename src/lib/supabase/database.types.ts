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
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
