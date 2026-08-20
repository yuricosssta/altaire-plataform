// src/components/themes/ThemeModeSelect.tsx
'use client';

import { Radar, Target, Compass, ArrowRight } from 'lucide-react';
import type { ThemeOrigin } from '@/lib/dto/themes.schema';

interface ThemeModeSelectProps {
  onSelect: (mode: ThemeOrigin) => void;
}

const MODES: {
  mode: ThemeOrigin;
  title: string;
  description: string;
  icon: typeof Target;
  hint: string;
}[] = [
  {
    mode: 'roma_avatar',
    title: 'Temas a partir da ROMA & Avatar',
    description:
      'A IA lê a ROMA, o avatar e a árvore de objeções do projeto e aplica as técnicas de temas raiz internamente.',
    icon: Target,
    hint: 'Pilares, dores, desejos e objeções já cadastrados',
  },
  {
    mode: 'market',
    title: 'Temas a partir de Dados de Mercado (Internet)',
    description:
      'Radar de mercado: analisa vídeos, reviews, comentários e termos periféricos do nicho para achar temas que ninguém está cobrindo.',
    icon: Radar,
    hint: 'Comentários, reviews e vídeos do seu nicho',
  },
  {
    mode: 'objective',
    title: 'Temas a partir do Objetivo/Momento do Negócio',
    description:
      'Combina a biblioteca de temas com o objetivo do período e o momento do negócio para priorizar o que publicar agora.',
    icon: Compass,
    hint: 'Objetivo do ciclo, momento e plataformas',
  },
];

export function ThemeModeSelect({ onSelect }: ThemeModeSelectProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-md border border-primary/30 bg-primary/10 p-4 font-sans text-sm leading-relaxed text-foreground">
        <p className="font-bold text-primary">Como a IA trabalha por baixo dos panos</p>
        <p className="mt-1 text-muted-foreground">
          O motor lê automaticamente a linha editorial, o calendário e tudo que veio da Fase 1 do
          método (ROMA, PUV, MUV, avatar, objeções, RETINA, jornada). As 5 técnicas de conteúdo raiz
          e as 8 técnicas avançadas são acionadas automaticamente conforme o contexto — você só
          escolhe a direção.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {MODES.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.mode}
              type="button"
              onClick={() => onSelect(item.mode)}
              className="group flex flex-col rounded-md border border-border bg-card p-6 text-left transition-all hover:border-primary"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="font-serif text-xl leading-tight text-foreground">{item.title}</h3>
              <p className="mt-2 flex-1 font-sans text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  {item.hint}
                </span>
                <ArrowRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-1" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}