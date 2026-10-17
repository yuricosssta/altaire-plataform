// FrontEnd/src/app/page.tsx
import type { Metadata } from "next";

import { LandingPageHeader } from "@/components/LandingPageHeader";
import { Footer } from "@/components/Footer";
import { BenefitsSection } from "@/components/landing/BenefitsSection";
import { DemoSection } from "@/components/landing/DemoSection";
import { DifferentialsSection } from "@/components/landing/DifferentialsSection";
import { EvidenceSection } from "@/components/landing/EvidenceSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { FinalCTASection } from "@/components/landing/FinalCTASection";
import { FunctionsSection } from "@/components/landing/FunctionsSection";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { ParadigmShiftSection } from "@/components/landing/ParadigmShiftSection";
import { PositioningBandSection } from "@/components/landing/PositioningBandSection";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { ProductMechanismSection } from "@/components/landing/ProductMechanismSection";

export const metadata: Metadata = {
  title: "Legion Altaire | Estratégia, conteúdo, autoridade e vendas",
  description:
    "Transforme a estratégia do seu negócio em uma operação editorial clara, organizada e executável orientada por contexto.",
};

export default function HomePage() {
  return (
    <div
      data-la-surface="dark"
      className="flex min-h-screen flex-col bg-la-canvas font-la-sans text-la-text-primary selection:bg-la-gold/25 selection:text-la-gold-light"
    >
      {/* 01. Header Público Canônico */}
      <LandingPageHeader mainContentId="main-content" />

      {/* Conteúdo Principal com as Seções 02 a 14 na Ordem Narrativa Canônica */}
      <main id="main-content" className="relative flex-1">
        {/* 02. Hero Definitivo (#inicio) */}
        <HeroSection />

        {/* 03. Faixa de Posicionamento (#posicionamento) */}
        <PositioningBandSection />

        {/* 04. O Problema (#problema) */}
        <ProblemSection />

        {/* 05. Mudança de Paradigma (#mudanca-de-paradigma) */}
        <ParadigmShiftSection />

        {/* 06. Como o Legion Altaire Pensa — Scrollytelling Principal (#produto) */}
        <ProductMechanismSection />

        {/* 07. Demonstração (#demonstracao) */}
        <DemoSection />

        {/* 08. Três Funções (#funcoes) */}
        <FunctionsSection />

        {/* 09. Como Funciona (#como-funciona) */}
        <HowItWorksSection />

        {/* 10. Benefícios (#beneficios) */}
        <BenefitsSection />

        {/* 11. Diferenciais (#diferenciais) */}
        <DifferentialsSection />

        {/* 12. Provas e Acompanhamento (#provas) */}
        <EvidenceSection />

        {/* 13. Perguntas Frequentes (#perguntas-frequentes) */}
        <FAQSection />

        {/* 14. CTA Final (#comecar) */}
        <FinalCTASection />
      </main>

      {/* 15. Rodapé Institucional (#rodape) */}
      <Footer />
    </div>
  );
}