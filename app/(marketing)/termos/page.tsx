import Link from 'next/link';

export default function TermosPage() {
  return (
    <main className="container max-w-2xl py-16">
      <Link href="/" className="text-sm text-muted-foreground hover:underline">
        ← Voltar
      </Link>
      <h1 className="mt-4 font-display text-3xl font-bold">Termos de Uso</h1>
      <div className="prose prose-sm mt-6 max-w-none text-muted-foreground">
        <p>
          Este é um modelo de Termos de Uso para o TreinaPro. Substitua este texto pelo
          conteúdo jurídico revisado por um advogado antes de operar em produção.
        </p>
        <h2 className="mt-6 font-display text-lg font-semibold text-foreground">1. Sobre o serviço</h2>
        <p>
          A plataforma conecta personal trainers e seus alunos para gestão de treinos,
          anamneses, avaliações físicas e comunicação.
        </p>
        <h2 className="mt-6 font-display text-lg font-semibold text-foreground">2. Cadastro e contas</h2>
        <p>
          Personal trainers criam suas próprias contas. Alunos são cadastrados
          exclusivamente por convite do respectivo personal trainer.
        </p>
        <h2 className="mt-6 font-display text-lg font-semibold text-foreground">3. Planos e cobrança</h2>
        <p>
          O plano gratuito permite o cadastro de 1 aluno. O plano Premium, cobrado
          mensalmente via Stripe, permite alunos ilimitados e recursos adicionais. O
          cancelamento pode ser feito a qualquer momento pelo portal de cobrança.
        </p>
        <h2 className="mt-6 font-display text-lg font-semibold text-foreground">4. Responsabilidades</h2>
        <p>
          As informações de treino e saúde inseridas na plataforma são de responsabilidade
          de quem as insere. A plataforma não substitui acompanhamento médico.
        </p>
      </div>
    </main>
  );
}
