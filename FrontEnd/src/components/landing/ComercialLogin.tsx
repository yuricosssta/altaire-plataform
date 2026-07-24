// src/components/landing/ComercialLogin.tsx
"use client";

import { Sparkles, Workflow, TrendingUp } from 'lucide-react';
import LogoBloco from '@/components/LogoBloco';

export function ComercialLogin() {
    return (
        <div className="relative hidden lg:flex h-full flex-col bg-background text-foreground p-10 border-l border-border">
            {/* Efeito radial dinâmico consumindo a variável primária (Dourado) com opacidade controlada */}
            <div className="absolute inset-0 bg-background bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,hsl(var(--primary)/0.12),transparent)]" />

            <div className="relative z-20 flex items-center gap-2">
                <LogoBloco />
            </div>

            <div className="relative z-20 mt-auto mb-auto max-w-lg mx-auto">
                <h2 className="font-heading text-4xl font-bold tracking-tight mb-8 leading-tight text-foreground">
                    Domine a escala do seu negócio digital.
                </h2>
                
                <div className="space-y-8 text-muted-foreground">
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-card rounded-md border border-border text-primary shadow-sm">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="font-subheading text-foreground font-bold text-lg">Aceleração de Conteúdo</h4>
                            <p className="font-sans text-sm leading-relaxed mt-1">
                                Escale sua produção e estruturação de copy. Mantenha a autenticidade do seu especialista.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-card rounded-md border border-border text-primary shadow-sm">
                            <Workflow className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="font-subheading text-foreground font-bold text-lg">Esteira de Vendas</h4>
                            <p className="font-sans text-sm leading-relaxed mt-1">
                                Funis de alta conversão pré-configurados. Transforme leads em clientes de forma previsível e automatizada.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-card rounded-md border border-border text-primary shadow-sm">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="font-subheading text-foreground font-bold text-lg">Métricas Absolutas</h4>
                            <p className="font-sans text-sm leading-relaxed mt-1">
                                Acompanhe ROI, taxas de conversão e faturamento em tempo real para otimização imediata das suas campanhas.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative z-20 mt-auto font-sans text-sm text-muted-foreground font-medium">
                © {new Date().getFullYear()} Cazuá. Gestão inteligente de projetos.
            </div>
        </div>
    );
}