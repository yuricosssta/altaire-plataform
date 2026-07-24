// src/components/LandingPageHeader.tsx
"use function";

import React from "react";
import Link from "next/link";
import {
  BarChart3,
  Target,
  Award,
  ArrowRight,
  Sparkles,
  Users,
  Workflow
} from "lucide-react";
import LogoBloco from "./LogoBloco";

// Componente para as Badges de Recurso
export function FeatureBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
      {children}
    </span>
  );
}

// Dados dos Recursos refatorados para o ecossistema Altaire
export const FEATURES = [
  {
    icon: Sparkles,
    title: "Acelerador de Conteúdo com IA",
    description: "Geração de copies, roteiros e automações integradas. Escale sua produção e mantenha a autenticidade do seu especialista."
  },
  {
    icon: Workflow,
    title: "Esteira de Vendas Automatizada",
    description: "Funis de alta conversão pré-configurados. Transforme leads em clientes recorrentes com processos previsíveis e escaláveis."
  },
  {
    icon: Users,
    title: "Gestão de Alunos e Comunidade",
    description: "Área de membros com posicionamento premium. Engaje seus alunos e aumente o LTV com gamificação e suporte centralizado."
  },
  {
    icon: BarChart3,
    title: "Dashboard de Lançamentos",
    description: "Métricas absolutas. Acompanhe ROI, taxas de conversão e faturamento em tempo real para otimização imediata de campanhas."
  }
];

export function LandingPageHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/30 backdrop-blur">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Renderiza o Logo - Requer atualização interna do SVG/Texto para "Altaire" */}
        <LogoBloco orientation="horizontal"/>
        
        <div className="flex items-center gap-4">
          <Link 
            href="/signup" 
            className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            Criar Conta Grátis
          </Link>
          <Link 
            href="/login" 
            className="flex items-center gap-2 px-6 py-2 text-sm font-bold bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors shadow-sm"
          >
            Entrar
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}