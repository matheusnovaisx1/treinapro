import type { Metadata, Viewport } from 'next';
import { Nunito } from 'next/font/google';
import { Providers } from '@/components/providers';
import { PwaRegister } from '@/components/pwa-register';
import './globals.css';

// Nunito: fonte arredondada e acolhedora (aproxima o "cozy" do Duolingo),
// usada tanto no corpo quanto nos títulos.
const nunito = Nunito({ subsets: ['latin'], display: 'swap', variable: '--font-nunito' });

export const metadata: Metadata = {
  title: 'TreinaPro — Gestão para Personal Trainers',
  description: 'Treinos, anamneses, avaliações e evolução dos seus alunos em um só lugar.',
  applicationName: 'TreinaPro',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'TreinaPro' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Trava o zoom/pan (evita a WebView do app nativo abrir "deslocada" e ter
  // que arrastar de lado). Dá o comportamento app-like.
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0f1729',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={nunito.variable}>
      <body>
        {/* Aplica o tema salvo antes da pintura, evitando "flash" do tema errado. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('tp_theme');if(t==='light'||(t==='system'&&matchMedia('(prefers-color-scheme: light)').matches)){document.documentElement.classList.add('light');}}catch(e){}})();`,
          }}
        />
        <Providers>{children}</Providers>
        <PwaRegister />
      </body>
    </html>
  );
}
