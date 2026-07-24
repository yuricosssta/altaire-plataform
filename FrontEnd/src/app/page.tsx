// src/app/page.tsx
import { Metadata } from 'next';
import { Footer } from "@/components/Footer";
import { FeatureSection } from "@/components/landing/FeatureSection";
import { HeroSection } from "@/components/landing/HeroSection";
import { ProductsSection } from "@/components/landing/ProductsSection";
import { LandingPageHeader } from "@/components/LandingPageHeader";

export const metadata: Metadata = {
  title: 'Altaire | Aceleração de Negócios Digitais',
  description: 'Escale seu negócio digital do absoluto zero. Sistema integrado de formação, automação e estratégias de alta conversão.',
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <LandingPageHeader />
      <HeroSection />
      <FeatureSection />
      <ProductsSection />
      <Footer />
    </main>
  );
}