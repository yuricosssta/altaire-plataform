// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Inter, Playfair_Display, DM_Serif_Display } from 'next/font/google';
import { ReduxProvider } from "@/providers/ReduxProvider";
import { cn } from "../lib/utils";
import { ThemeProvider } from "../providers/ThemeProvider";
import AuthInitializer from "@/providers/AuthInitializer";
import { Toaster as Toast } from 'sonner';

// Instanciação de Fontes (Google Fonts)
const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-inter',
  display: 'swap'
});

const playfair = Playfair_Display({ 
  subsets: ['latin'], 
  variable: '--font-playfair',
  display: 'swap'
});

const dmSerif = DM_Serif_Display({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    template: '%s | Altaire',
    default: 'Altaire - Aceleração e Gestão de Negócios Digitais',
  },
  description: "SaaS Educacional e Assistente de Criação de Conteúdo. Escale seu negócio digital do absoluto zero à automação em vendas.",
  keywords: [
    'marketing digital', 
    'infoprodutos', 
    'liberdade financeira', 
    'automação de vendas', 
    'criação de conteúdo', 
    'saas educacional'
  ],
  openGraph: {
    title: 'Altaire - Aceleração e Gestão de Negócios Digitais',
    description: 'Construa, escale e automatize seu negócio digital. Domine as estratégias para alcançar liberdade financeira e geográfica.',
    url: 'https://legionaltaire.com',
    siteName: 'Altaire',
    locale: 'pt_BR',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={cn(
      inter.variable,
      playfair.variable,
      dmSerif.variable
    )}>
      <body className={cn(
        "min-h-screen bg-background font-sans text-foreground antialiased"
      )}>
        <ThemeProvider>
          <ReduxProvider>
            <AuthInitializer>
              {children}
              <Toast richColors position="top-right" theme="dark" />
            </AuthInitializer>
          </ReduxProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}