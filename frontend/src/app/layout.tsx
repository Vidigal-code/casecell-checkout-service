import type { Metadata } from 'next';
import { Space_Grotesk, Work_Sans } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Header } from '@/widgets/header/ui/header';
import { Footer } from '@/widgets/footer/ui/footer';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
});

const workSans = Work_Sans({
  subsets: ['latin'],
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: 'CaseCellShop Checkout Experience',
  description:
    'Experiência de compra resiliente e responsiva para capinhas CaseCellShop com controle de estoque em tempo real.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${spaceGrotesk.variable} ${workSans.variable}`}>
      <body className="bg-grid-pattern bg-orb-gradient">
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 pt-[var(--header-height)]">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
