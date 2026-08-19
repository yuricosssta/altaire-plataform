//src/app/(main)/dashboard/editorial/[projectId]/linha-editorial/[versionId]/mapa/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Flag, Layers, Mic, PieChart, CheckCircle2, Loader2 } from 'lucide-react';
import { EditorialMapaDTO } from '@/lib/dto/editorial.schema';
import { editorialService } from '@/lib/services/editorialService';

export default function MapaLinhaEditorialPage() {
  const params = useParams();
  const projectId = params.projectId;
  const versionId = params.versionId;
  const [mapa, setMapa] = useState<EditorialMapaDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    editorialService
      .getMapa(versionId as string)
      .then((data) => {
        if (active) setMapa(data);
      })
      .catch((err: any) => {
        if (active) setError(err?.response?.data?.error || err?.message || 'Falha ao carregar o mapa editorial.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [versionId]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background p-8 text-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 py-24 font-sans text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          Carregando mapa editorial...
        </div>
      </main>
    );
  }

  if (!isLoading && (error || !mapa)) {
    return (
      <main className="min-h-screen bg-background p-8 text-foreground">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-md border border-border bg-card p-6 font-sans text-sm text-red-500">
            {error || 'Mapa não encontrado.'}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background p-8 text-foreground">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/dashboard/editorial/${projectId}`}
              className="rounded-md border border-border bg-card p-2 text-foreground transition-colors hover:text-primary"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <p className="font-sans text-sm text-primary uppercase tracking-widest">
                Mapa Estratégico — v{mapa!.versionNumber}
              </p>
              <h1 className="font-serif text-3xl text-foreground">
                {mapa!.name}
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
              {mapa!.mensagemCentral}
            </p>
          </section>

          {/* Tom de Voz */}
          <section className="col-span-1 rounded-md border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3 border-b border-border pb-4">
              <Mic className="h-6 w-6 text-primary" />
              <h2 className="font-serif text-2xl text-foreground">Tom de Voz</h2>
            </div>
            <div className="mb-6 flex flex-wrap gap-2">
              {mapa!.tomDeVoz.traits.map((trait, i) => (
                <span key={i} className="rounded-md bg-primary/10 px-3 py-1 font-sans text-sm font-bold text-primary">
                  {trait}
                </span>
              ))}
            </div>
            <ul className="space-y-3 font-sans text-sm text-muted-foreground">
              {mapa!.tomDeVoz.rules.map((rule, i) => (
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
              {mapa!.pilares.map((pilar, index) => (
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
              {mapa!.retina.map((item, index) => (
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