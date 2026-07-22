import Link from 'next/link';

// Mantido deliberadamente "leve": sem importar componentes de UI (Button etc.),
// porque qualquer import que puxe bibliotecas baseadas em React Context na
// cadeia faz o Next 14 falhar ao coletar dados estáticos desta página
// (erro "createContext is not a function" no _not-found).
export default function NotFound() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        padding: '1rem',
        textAlign: 'center',
        background: 'hsl(220 15% 7%)',
        color: 'hsl(210 20% 96%)',
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          height: '3rem',
          width: '3rem',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '0.75rem',
          background: 'hsl(24 95% 53%)',
          fontSize: '1.5rem',
        }}
      >
        🏋️
      </div>
      <h1 style={{ fontSize: '1.875rem', fontWeight: 700, margin: 0 }}>Página não encontrada</h1>
      <p style={{ maxWidth: '24rem', color: 'hsl(215 15% 65%)' }}>
        O link que você acessou não existe ou foi movido. Volte para o início e tente novamente.
      </p>
      <Link
        href="/"
        style={{
          background: 'hsl(24 95% 53%)',
          color: '#fff',
          fontWeight: 700,
          padding: '0.75rem 2rem',
          borderRadius: '1rem',
          textDecoration: 'none',
        }}
      >
        Voltar ao início
      </Link>
    </main>
  );
}
