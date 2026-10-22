// FrontEnd/src/app/(public)/layout.tsx
import type { ReactNode } from "react";
import { LandingPageHeader } from "@/components/LandingPageHeader";
import { Footer } from "@/components/Footer";

export type PublicPagesLayoutProps = {
  readonly children: ReactNode;
};

/**
 * Layout Canônico Compartilhado das Páginas Públicas Secundárias (`(public)`).
 *
 * Engloba `/precos`, `/sobre`, `/contato`, `/termos-de-uso`,
 * `/politica-de-privacidade` e `/politica-de-cookies`, garantindo:
 * - Atmosfera dark-first (`bg-la-canvas text-la-text-primary [color-scheme:dark]`).
 * - `<LandingPageHeader />` fixo com vidro fumê translúcido e Portal Mobile.
 * - Região `<main id="public-main-content">` conectada ao Skip Link de acessibilidade.
 * - `<Footer />` institucional com retorno ao `/#topo` e modal de cookies.
 */
export default function PublicPagesLayout({
  children,
}: PublicPagesLayoutProps) {
  return (
    <div
      data-la-surface="dark"
      className="relative flex min-h-screen flex-col bg-la-canvas font-la-sans text-la-text-primary antialiased selection:bg-la-gold/25 selection:text-la-gold-bright [color-scheme:dark]"
    >
      <LandingPageHeader mainContentId="public-main-content" />

      <main
        id="public-main-content"
        className="relative flex-1 focus:outline-none"
      >
        {children}
      </main>

      <Footer />
    </div>
  );
}