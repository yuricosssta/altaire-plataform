// FrontEnd/src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Inter, Playfair_Display, DM_Serif_Display } from "next/font/google";
import { Toaster as Toast } from "sonner";
import { ReduxProvider } from "@/providers/ReduxProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import AuthInitializer from "@/providers/AuthInitializer";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const dmSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Legion Altaire",
    default:
      "Legion Altaire | Plataforma de IA para estratégia, conteúdo, autoridade e execução editorial",
  },
  description:
    "O Legion Altaire conecta sua oferta, seu público e seu posicionamento a um fluxo estratégico de planejamento, temas, calendários, roteiros e ativos prontos para produção.",
  keywords: [
    "Legion Altaire",
    "estratégia de conteúdo",
    "operação editorial",
    "planejamento editorial com IA",
    "linha editorial",
    "calendário editorial",
    "roteiros de conteúdo",
    "autoridade e vendas",
  ],
  openGraph: {
    title:
      "Legion Altaire | Plataforma de IA para estratégia, conteúdo, autoridade e execução editorial",
    description:
      "Transforme a estratégia do seu negócio em uma operação editorial clara, organizada e executável.",
    url: "https://legionaltaire.com",
    siteName: "Legion Altaire",
    locale: "pt_BR",
    type: "website",
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
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={cn(inter.variable, playfair.variable, dmSerif.variable)}
    >
      <body
        className={cn(
          "min-h-screen bg-background font-sans text-foreground antialiased"
        )}
      >
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