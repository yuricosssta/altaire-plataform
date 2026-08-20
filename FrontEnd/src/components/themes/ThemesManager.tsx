// src/components/themes/ThemesManager.tsx
'use client';

import { useState } from 'react';
import { Lightbulb, Library, Sparkles, CalendarRange } from 'lucide-react';
import { ThemeGenerationPanel } from './generate/ThemeGenerationPanel';
import { ThemeLibrary } from './ThemeLibrary';
import { ThemeCalendarIntegration } from './calendar/ThemeCalendarIntegration';

interface ThemesManagerProps {
  projectId: string;
}

type SubArea = 'generate' | 'library' | 'calendar';

const SUB_AREAS: { id: SubArea; label: string; description: string; icon: typeof Lightbulb }[] = [
  {
    id: 'generate',
    label: 'Gerar Temas',
    description: 'Motor unificado com 3 modos: ROMA & Avatar, Mercado/Internet e Objetivo/Momento.',
    icon: Sparkles,
  },
  {
    id: 'library',
    label: 'Mapa de Temas',
    description: 'Biblioteca estratégica com classificação, filtros e marcações.',
    icon: Library,
  },
  {
    id: 'calendar',
    label: 'Integração com Calendário',
    description: 'Encaixe os temas nos slots do calendário editorial e equilibre o período.',
    icon: CalendarRange,
  },
];

export function ThemesManager({ projectId }: ThemesManagerProps) {
  const [active, setActive] = useState<SubArea>('generate');

  return (
    <div className="space-y-6">
      <div className="mb-2 flex flex-wrap items-center gap-3 rounded-md border border-border bg-card p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-primary/30 bg-primary/10 text-primary">
          <Lightbulb className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-serif text-xl text-foreground">Temas e Ideias Estratégicas</h2>
          <p className="font-sans text-sm text-muted-foreground">
            O motor de temas lê a Função 01 e a Fase 1 do método para gerar, organizar e distribuir
            conteúdo de forma inteligente.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {SUB_AREAS.map((area) => {
          const Icon = area.icon;
          const isActive = active === area.id;
          return (
            <button
              key={area.id}
              type="button"
              onClick={() => setActive(area.id)}
              className={`flex items-start gap-3 rounded-md border p-4 text-left transition-all ${
                isActive ? 'border-primary bg-primary/10' : 'border-border bg-card hover:border-primary/40'
              }`}
            >
              <div
                className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${
                  isActive ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p
                  className={`font-sans text-sm font-bold ${
                    isActive ? 'text-primary' : 'text-foreground'
                  }`}
                >
                  {area.label}
                </p>
                <p className="mt-1 font-sans text-xs leading-relaxed text-muted-foreground">
                  {area.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="rounded-md border border-border bg-card p-6">
        {active === 'generate' && <ThemeGenerationPanel projectId={projectId} />}
        {active === 'library' && <ThemeLibrary projectId={projectId} />}
        {active === 'calendar' && <ThemeCalendarIntegration projectId={projectId} />}
      </div>
    </div>
  );
}