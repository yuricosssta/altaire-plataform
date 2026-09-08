'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Video, Film, Radio, Columns, Image, Square,
  Plus, Loader2, ChevronRight, FileText, Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import { scriptsService } from '@/lib/services/scriptsService';
import { FORMAT_LABELS, FORMAT_DESCRIPTIONS, FORMAT_ICONS, FORMAT_ROUTE } from '@/lib/mocks/scripts.mock';
import type { Script, ScriptFormat, ScriptStatus } from '@/lib/dto/editorial.schema';

const ALL_FORMATS: ScriptFormat[] = ['video_curto', 'video_longo', 'live', 'carrossel', 'post_estatico', 'stories_sequence'];

const FORMAT_ORDER: Record<ScriptFormat, number> = {
  video_curto: 0,
  video_longo: 1,
  live: 2,
  carrossel: 3,
  post_estatico: 4,
  stories_sequence: 5,
};

const ICON_MAP: Record<string, typeof Video> = {
  Video, Film, Radio, Columns, Image, Square,
};

const STATUS_BADGE: Record<ScriptStatus, { label: string; color: string }> = {
  rascunho: { label: 'Rascunho', color: 'bg-zinc-400/20 text-zinc-400' },
  pronto: { label: 'Pronto', color: 'bg-primary/20 text-primary' },
  publicado: { label: 'Publicado', color: 'bg-emerald-500/20 text-emerald-500' },
  teste_ab: { label: 'Teste A/B', color: 'bg-amber-500/20 text-amber-500' },
};

function FormatCard({ format, scripts, projectId }: { format: ScriptFormat; scripts: Script[]; projectId: string }) {
  const IconComponent = ICON_MAP[FORMAT_ICONS[format]] || FileText;
  const statusCount: Record<string, number> = {};
  for (const s of scripts) {
    statusCount[s.status] = (statusCount[s.status] || 0) + 1;
  }

  return (
    <Link
      href={`/dashboard/editorial/${projectId}/roteiros/${FORMAT_ROUTE[format]}`}
      className="group flex flex-col rounded-md border border-border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-lg"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary">
          <IconComponent className="h-6 w-6" />
        </div>
        <span className="font-sans text-2xl font-bold text-foreground">
          {scripts.length}
        </span>
      </div>
      <h3 className="font-heading text-lg text-foreground mb-1">{FORMAT_LABELS[format]}</h3>
      <p className="font-sans text-sm text-muted-foreground mb-4 line-clamp-2">
        {FORMAT_DESCRIPTIONS[format]}
      </p>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {Object.entries(statusCount).map(([status, count]) => {
          const badge = STATUS_BADGE[status as ScriptStatus];
          if (!badge) return null;
          return (
            <span
              key={status}
              className={`rounded-md px-2 py-0.5 font-sans text-[11px] font-medium ${badge.color}`}
            >
              {badge.label}: {count}
            </span>
          );
        })}
        {scripts.length === 0 && (
          <span className="font-sans text-xs text-muted-foreground">Nenhum roteiro ainda</span>
        )}
      </div>
      <div className="mt-auto flex items-center gap-1 font-sans text-sm font-bold text-primary opacity-0 transition-opacity group-hover:opacity-100">
        <span>Abrir</span>
        <ChevronRight className="h-4 w-4" />
      </div>
    </Link>
  );
}

export function ScriptsDashboard({ projectId }: { projectId: string }) {
  const [scriptsByFormat, setScriptsByFormat] = useState<Record<ScriptFormat, Script[]>>({} as any);
  const [loading, setLoading] = useState(true);

  const loadScripts = useCallback(async () => {
    setLoading(true);
    try {
      const all = await scriptsService.listScripts(projectId);
      const grouped: Record<ScriptFormat, Script[]> = {
        video_curto: [], video_longo: [], live: [], carrossel: [], post_estatico: [], stories_sequence: [],
      };
      for (const script of all) {
        if (grouped[script.format]) grouped[script.format].push(script);
      }
      setScriptsByFormat(grouped);
    } catch (err: any) {
      toast.error(err?.message || 'Erro ao carregar roteiros');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { loadScripts(); }, [loadScripts]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-3 font-sans text-muted-foreground">Carregando roteiros...</span>
      </div>
    );
  }

  const sortedFormats = [...ALL_FORMATS].sort((a, b) => FORMAT_ORDER[a] - FORMAT_ORDER[b]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="font-heading text-2xl text-foreground">Função 03 — Criação de Roteiros</h1>
          <p className="font-sans text-sm text-muted-foreground mt-1">
            Escolha um formato para criar ou gerenciar roteiros
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/dashboard/editorial/${projectId}/roteiros/criar`}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 font-sans text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Novo Roteiro
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sortedFormats.map((format) => (
          <FormatCard
            key={format}
            format={format}
            scripts={scriptsByFormat[format] || []}
            projectId={projectId}
          />
        ))}
      </div>

      {/* Link para ver todos os roteiros */}
      <div className="text-center pt-4">
        <Link
          href={`/dashboard/editorial/${projectId}/roteiros/listar`}
          className="font-sans text-sm text-primary underline underline-offset-4 hover:opacity-80"
        >
          Ver todos os roteiros do projeto
        </Link>
      </div>
    </div>
  );
}