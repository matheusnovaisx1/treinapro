import Link from 'next/link';

export default function PrivacidadePage() {
  return (
    <main className="container max-w-2xl py-16">
      <Link href="/" className="text-sm text-muted-foreground hover:underline">
        ← Voltar
      </Link>
      <h1 className="mt-4 font-display text-3xl font-bold">Política de Privacidade</h1>
      <div className="prose prose-sm mt-6 max-w-none text-muted-foreground">
        <p>
          Este é um modelo de Política de Privacidade para o TreinaPro. Substitua este
          texto pelo conteúdo revisado por um advogado, adequado à LGPD, antes de operar
          em produção.
        </p>
        <h2 className="mt-6 font-display text-lg font-semibold text-foreground">1. Dados coletados</h2>
        <p>
          Coletamos nome, e-mail, dados de anamnese, medidas físicas, fotos de avaliação
          (quando enviadas) e registros de treino, necessários para o funcionamento do
          serviço entre personal trainer e aluno.
        </p>
        <h2 className="mt-6 font-display text-lg font-semibold text-foreground">2. Armazenamento</h2>
        <p>
          Os dados são armazenados no Supabase (banco de dados e Storage), com controle de
          acesso por linha (Row Level Security): cada personal só acessa dados dos próprios
          alunos, e cada aluno só acessa os próprios dados.
        </p>
        <h2 className="mt-6 font-display text-lg font-semibold text-foreground">3. Pagamentos</h2>
        <p>
          Os dados de pagamento da assinatura Premium são processados diretamente pelo
          Stripe; não armazenamos números de cartão em nossos servidores.
        </p>
        <h2 className="mt-6 font-display text-lg font-semibold text-foreground">4. Seus direitos</h2>
        <p>
          Você pode solicitar a exclusão ou exportação dos seus dados a qualquer momento
          entrando em contato com o personal trainer responsável pela sua conta ou com o
          suporte da plataforma.
        </p>
      </div>
    </main>
  );
}
