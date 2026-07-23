// src/components/landing/HeroSection.tsx
import Link from "next/link";
import { ArrowRight, PlayCircle, Trophy, Users, CheckCircle } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative w-full min-h-screen flex flex-col justify-center overflow-hidden border-b border-border">
      {/* Background Gradient/Overlay para simular a profundidade da imagem de referência */}
      <div className="absolute inset-0 bg-background z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent z-10" />
        {/* Placeholder para a imagem de fundo de alta qualidade (estilo dark/luxury) */}
        <div className="absolute top-0 right-0 w-2/3 h-full bg-[url('/hero-bg.jpg')] bg-cover bg-center opacity-40 mix-blend-overlay" />
      </div>

      <div className="container relative z-20 mx-auto px-6 pt-32 pb-16 flex flex-col items-start w-full lg:w-3/4 xl:w-2/3">
        <span className="text-primary text-sm font-bold tracking-widest uppercase mb-4 flex items-center gap-2">
          <span className="w-8 h-[2px] bg-primary"></span>
          A Jornada Definitiva
        </span>
        
        <h1 className="font-heading text-5xl md:text-7xl font-bold leading-tight mb-6 text-foreground">
          Aceleração Digital <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-yellow-600">
            Redefinida.
          </span>
        </h1>
        
        <p className="font-sans text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl leading-relaxed">
          Descubra a performance de elite no mercado digital. Estratégias validadas, automação de vendas e design atemporal. Assuma o controle do seu destino financeiro.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <Link 
            href="/produtos" 
            className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            EXPLORAR MÉTODOS
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <button 
            className="inline-flex h-12 items-center justify-center rounded-md border border-border bg-transparent px-8 text-sm font-semibold text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <PlayCircle className="mr-2 h-4 w-4 text-primary" />
            ASSISTIR VÍDEO
          </button>
        </div>

        {/* Stats Section espelhando a referência */}
        <div className="flex items-center gap-8 md:gap-16 border-t border-border/50 pt-8 mt-auto">
          <div className="flex flex-col">
            <span className="flex items-center text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              <Trophy className="w-4 h-4 mr-2 text-primary" />
              Módulos Premium
            </span>
            <span className="text-3xl font-heading font-bold text-foreground">50+</span>
          </div>
          <div className="flex flex-col">
            <span className="flex items-center text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              <Users className="w-4 h-4 mr-2 text-primary" />
              Alunos Ativos
            </span>
            <span className="text-3xl font-heading font-bold text-foreground">10K+</span>
          </div>
          <div className="flex flex-col">
            <span className="flex items-center text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              <CheckCircle className="w-4 h-4 mr-2 text-primary" />
              Estratégias Válidas
            </span>
            <span className="text-3xl font-heading font-bold text-foreground">100%</span>
          </div>
        </div>
      </div>
    </section>
  );
}