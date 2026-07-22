// Fonte única dos planos. Se mudar limite/preço aqui, replique também no trigger
// `enforce_student_plan_limit` em supabase/schema.sql (o Postgres não lê este arquivo).

export type PlanId = 'free' | 'pro' | 'premium';

export type PlanTier = {
  id: PlanId;
  name: string;
  price: number;
  studentLimit: number | null; // null = ilimitado
  features: string[];
  stripePriceEnvVar?: 'STRIPE_PRO_PRICE_ID' | 'STRIPE_PREMIUM_PRICE_ID';
};

export const PLAN_TIERS: PlanTier[] = [
  {
    id: 'free',
    name: 'Grátis',
    price: 0,
    studentLimit: 1,
    features: ['1 aluno ativo', 'Treinos, anamnese e avaliações ilimitados', 'Chat com o aluno'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29.9,
    studentLimit: 3,
    features: ['Até 3 alunos ativos', 'Tudo do plano Grátis', 'Gráficos de evolução por aluno'],
    stripePriceEnvVar: 'STRIPE_PRO_PRICE_ID',
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 59.9,
    studentLimit: null,
    features: ['Alunos ilimitados', 'Tudo do plano Pro', 'Relatórios avançados', 'Exportação de dados', 'Suporte prioritário'],
    stripePriceEnvVar: 'STRIPE_PREMIUM_PRICE_ID',
  },
];

export function getPlanTier(id: PlanId): PlanTier {
  return PLAN_TIERS.find((p) => p.id === id) ?? PLAN_TIERS[0];
}

/** Retorna o próximo plano acima do atual (para sugestão de upgrade). */
export function getNextTier(id: PlanId): PlanTier | null {
  const index = PLAN_TIERS.findIndex((p) => p.id === id);
  return PLAN_TIERS[index + 1] ?? null;
}
