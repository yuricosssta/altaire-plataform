//src/app/(main)/dashboard/editorial/[projectId]/linha-editorial/[versionId]/mapa/page.tsx
'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Flag, Layers, Mic, PieChart, CheckCircle2 } from 'lucide-react';

// Mock do DTO gerado pela IA após o Onboarding
const mockMapa = {
  version: 'v1',
  name: 'Campanha de Crescimento',
  mensagemCentral: 'A estagnação profissional não é falta de esforço, é falta de alinhamento estratégico. Defendemos a construção de autoridade baseada em execução real e metodologias validadas, combatendo o "achismo" no mercado digital.',
  pilares: [
    { title: 'Quebra de mitos do mercado', description: 'Desconstruir ideias falsas sobre atalhos no SaaS e na Engenharia.' },
    { title: 'Bastidores da execução', description: 'Mostrar o processo de desenvolvimento e tomada de decisão técnica.' },
    { title: 'Educação prática', description: 'Tutoriais rápidos e conceitos de arquitetura aplicados.' },
    { title: 'Narrativas de autoridade', description: 'Estudos de caso, resultados de projetos anteriores e histórico profissional.' },
  ],
  tomDeVoz: {
    traits: ['Direto', 'Professoral', 'Elegante', 'Incisivo'],
    rules: [
      'Evite jargões excessivos sem explicação imediata.',
      'Nunca faça promessas de ganhos fáceis.',
      'Abra raciocínios com dados ou constatações contraintuitivas.',
    ],
  },
  retina: [
    { label: 'Relacionamento', weight: 15 },
    { label: 'Engajamento', weight: 20 },
    { label: 'Transformação', weight: 30 },
    { label: 'Interação', weight: 10 },
    { label: 'Níveis de Consciência', weight: 15 },
    { label: 'Autoridade', weight: 10 },
  ],
};

export default function MapaLinhaEditorialPage() {
  const params = useParams();
  const projectId = params.projectId;

  return (
    <main className="min-h-screen bg-background p-8 text-foreground">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href={`/editorial/${projectId}`} 
              className="rounded-md border border-border bg-card p-2 text-foreground transition-colors hover:text-primary"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <p className="font-sans text-sm text-primary uppercase tracking-widest">
                Mapa Estratégico — {mockMapa.version.toUpperCase()}
              </p>
              <h1 className="font-serif text-3xl text-foreground">
                {mockMapa.name}
              </h1>
            </div>
          </div>
          <button className="rounded-md bg-primary px-6 py-2 font-sans text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90">
            Exportar / Compartilhar
          </button>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Mensagem Central */}
          <section className="col-span-1 lg:col-span-2 rounded-md border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3 border-b border-border pb-4">
              <Flag className="h-6 w-6 text-primary" />
              <h2 className="font-serif text-2xl text-foreground">Mensagem Central</h2>
            </div>
            <p className="font-sans text-lg leading-relaxed text-muted-foreground">
              {mockMapa.mensagemCentral}
            </p>
          </section>

          {/* Tom de Voz */}
          <section className="col-span-1 rounded-md border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3 border-b border-border pb-4">
              <Mic className="h-6 w-6 text-primary" />
              <h2 className="font-serif text-2xl text-foreground">Tom de Voz</h2>
            </div>
            <div className="mb-6 flex flex-wrap gap-2">
              {mockMapa.tomDeVoz.traits.map((trait, i) => (
                <span key={i} className="rounded-md bg-primary/10 px-3 py-1 font-sans text-sm font-bold text-primary">
                  {trait}
                </span>
              ))}
            </div>
            <ul className="space-y-3 font-sans text-sm text-muted-foreground">
              {mockMapa.tomDeVoz.rules.map((rule, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Pilares Editoriais */}
          <section className="col-span-1 lg:col-span-2 rounded-md border border-border bg-card p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3 border-b border-border pb-4">
              <Layers className="h-6 w-6 text-primary" />
              <h2 className="font-serif text-2xl text-foreground">Pilares Editoriais</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {mockMapa.pilares.map((pilar, index) => (
                <div key={index} className="rounded-md border border-border bg-background p-4">
                  <h3 className="mb-2 font-serif text-lg text-foreground">{pilar.title}</h3>
                  <p className="font-sans text-sm text-muted-foreground">{pilar.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Distribuição RETINA */}
          <section className="col-span-1 rounded-md border border-border bg-card p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3 border-b border-border pb-4">
              <PieChart className="h-6 w-6 text-primary" />
              <h2 className="font-serif text-2xl text-foreground">Distribuição RETINA</h2>
            </div>
            <div className="space-y-4">
              {mockMapa.retina.map((item, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between font-sans text-sm">
                    <span className="font-bold text-foreground">{item.label}</span>
                    <span className="text-primary">{item.weight}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-md bg-background border border-border">
                    <div 
                      className="h-full bg-primary transition-all duration-1000" 
                      style={{ width: `${item.weight}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}