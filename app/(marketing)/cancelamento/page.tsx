import Link from 'next/link';

export default function CancelamentoPage() {
  return (
    <main className="container max-w-2xl py-16">
      <Link href="/" className="text-sm text-muted-foreground hover:underline">
        ← Voltar
      </Link>
      <h1 className="mt-4 font-display text-3xl font-bold">Política de Cancelamento</h1>
      <div className="prose prose-sm mt-6 max-w-none text-muted-foreground">
        <p>
          Este é um modelo de Política de Cancelamento para o TreinaPro. Revise com um advogado
          antes de operar em produção.
        </p>

        <h2 className="mt-6 font-display text-lg font-semibold text-foreground">1. Como cancelar a assinatura</h2>
        <p>
          Você pode cancelar a qualquer momento em <strong>Configurações → Plano → Gerenciar</strong>,
          que abre o portal de cobrança seguro da Stripe. Não é preciso entrar em contato com o suporte.
        </p>

        <h2 className="mt-6 font-display text-lg font-semibold text-foreground">2. Quando o acesso termina</h2>
        <p>
          Ao cancelar, você mantém o acesso aos recursos pagos até o fim do período já pago. Após essa
          data, a conta volta automaticamente para o plano gratuito, sem cobrança de renovação.
        </p>

        <h2 className="mt-6 font-display text-lg font-semibold text-foreground">3. Reembolsos</h2>
        <p>
          As assinaturas são mensais e cobradas antecipadamente. Não há reembolso proporcional pelo
          período restante após o cancelamento, salvo quando exigido pela legislação aplicável.
        </p>

        <h2 className="mt-6 font-display text-lg font-semibold text-foreground">4. Seus dados após o cancelamento</h2>
        <p>
          Cancelar a assinatura não apaga sua conta — seus dados continuam disponíveis no plano
          gratuito. Se quiser remover tudo, use <strong>Configurações → Excluir minha conta</strong>.
        </p>

        <h2 className="mt-6 font-display text-lg font-semibold text-foreground">5. Excluir a conta</h2>
        <p>
          A exclusão da conta é permanente e apaga todos os dados vinculados (alunos, treinos,
          avaliações e mensagens), além de cancelar qualquer assinatura ativa. Esta ação não pode ser
          desfeita.
        </p>
      </div>
    </main>
  );
}
