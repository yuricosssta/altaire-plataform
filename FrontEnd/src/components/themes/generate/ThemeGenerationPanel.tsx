// src/components/themes/generate/ThemeGenerationPanel.tsx
'use client';

import { useState } from 'react';
import { ArrowLeft, CheckSquare, FlaskConical, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import type { GenerationRequest, GenerationResult, Theme, ThemeOrigin, ThemeStatus } from '@/lib/dto/themes.schema';
import { themesService } from '@/lib/services/themesService';
import { ThemeModeSelect } from '../ThemeModeSelect';
import { ThemeResultTable } from '../ThemeResultTable';
import { RomaAvatarForm } from './RomaAvatarForm';
import { MarketWizard } from './MarketWizard';
import { ObjectiveForm } from './ObjectiveForm';

interface ThemeGenerationPanelProps {
  projectId: string;
}

export function ThemeGenerationPanel({ projectId }: ThemeGenerationPanelProps) {
  const [mode, setMode] = useState<ThemeOrigin | null>(null);
  const [marketOpen, setMarketOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const handleModeSelect = (next: ThemeOrigin) => {
    if (next === 'market') {
      setMarketOpen(true);
      return;
    }
    setMode(next);
  };

  const handleGenerate = async (request: GenerationRequest) => {
    setGenerating(true);
    try {
      const data = await themesService.generate(projectId, request);
      setResult(data);
      setThemes(data.themes);
      setSelected(new Set());
      toast.success(`${data.themes.length} temas gerados com sucesso.`);
      if (request.mode === 'market') setMarketOpen(false);
    } catch (error: any) {
      toast.error(error?.message || 'Falha ao gerar os temas.');
    } finally {
      setGenerating(false);
    }
  };

  const patchLocalTheme = (themeId: string, patch: Partial<Theme>) => {
    setThemes((prev) => prev.map((theme) => (theme.id === themeId ? { ...theme, ...patch } : theme)));
  };

  const handleEditTitle = async (theme: Theme, title: string) => {
    const updated = await themesService.updateTheme(projectId, theme.id, { title });
    patchLocalTheme(theme.id, { title: updated.title });
    toast.success('Título do tema atualizado.');
  };

  const handleToggleFavorite = async (theme: Theme) => {
    const nextStatus: ThemeStatus = theme.status === 'favorite' ? 'active' : 'favorite';
    const updated = await themesService.updateTheme(projectId, theme.id, { status: nextStatus });
    patchLocalTheme(theme.id, { status: updated.status });
  };

  const handleDelete = async (theme: Theme) => {
    await themesService.deleteTheme(projectId, theme.id);
    setThemes((prev) => prev.filter((t) => t.id !== theme.id));
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(theme.id);
      return next;
    });
    toast.success('Tema excluído.');
  };

  const handleGenerateMore = async (theme: Theme) => {
    const more = await themesService.generateMore(projectId, theme.id);
    setThemes((prev) => [...prev, ...more]);
    toast.success(`${more.length} temas similares adicionados.`);
  };

  const handleBulkStatus = async (status: ThemeStatus) => {
    if (selected.size === 0) return;
    const updated = await themesService.bulkStatus(projectId, {
      themeIds: Array.from(selected),
      status,
    });
    const byId = new Map(updated.map((theme) => [theme.id, theme]));
    setThemes((prev) => prev.map((theme) => byId.get(theme.id) || theme));
    setSelected(new Set());
    toast.success(
      status === 'test'
        ? 'Temas marcados como teste de mercado.'
        : 'Temas adicionados à biblioteca oficial.',
    );
  };

  const renderForm = () => {
    if (mode === 'roma_avatar') {
      return <RomaAvatarForm projectId={projectId} onGenerate={handleGenerate} generating={generating} />;
    }
    if (mode === 'objective') {
      return <ObjectiveForm onGenerate={handleGenerate} generating={generating} />;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {!mode && !marketOpen && <ThemeModeSelect onSelect={handleModeSelect} />}

      <MarketWizard
        open={marketOpen}
        onOpenChange={setMarketOpen}
        onGenerate={handleGenerate}
        generating={generating}
      />

      {(mode === 'roma_avatar' || mode === 'objective') && (
        <div className="space-y-6">
          <button
            type="button"
            onClick={() => {
              setMode(null);
              setResult(null);
              setThemes([]);
            }}
            className="flex items-center gap-2 font-sans text-sm font-bold text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para seleção de modo
          </button>

          <div className="rounded-md border border-border bg-card p-6">
            <h3 className="mb-6 border-b border-border pb-4 font-serif text-xl text-foreground">
              {mode === 'roma_avatar'
                ? 'Gerar temas a partir da ROMA & Avatar'
                : 'Gerar temas a partir do Objetivo/Momento do Negócio'}
            </h3>
            {renderForm()}
          </div>
        </div>
      )}

      {themes.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
            <div>
              <h3 className="font-serif text-xl text-foreground">Temas gerados</h3>
              <p className="font-sans text-sm text-muted-foreground">
                {result?.mode === 'market'
                  ? 'Classificados automaticamente por pilar, RETINA, consciência, jornada e formato.'
                  : result?.mode === 'objective'
                    ? 'Priorizados para o objetivo e momento selecionados.'
                    : 'Temas raiz classificados por pilar, RETINA, consciência, jornada e formato.'}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => void handleBulkStatus('active')}
                disabled={selected.size === 0}
                className="flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/10 px-3 py-1.5 font-sans text-xs font-bold text-primary transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                <CheckSquare className="h-3.5 w-3.5" />
                Adicionar à biblioteca ({selected.size})
              </button>
              <button
                type="button"
                onClick={() => void handleBulkStatus('test')}
                disabled={selected.size === 0}
                className="flex items-center gap-1.5 rounded-md border border-sky-500/30 bg-sky-500/10 px-3 py-1.5 font-sans text-xs font-bold text-sky-400 transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                <FlaskConical className="h-3.5 w-3.5" />
                Teste de mercado ({selected.size})
              </button>
            </div>
          </div>

          <ThemeResultTable
            themes={themes}
            selectable
            selected={selected}
            onSelectionChange={setSelected}
            onEditTitle={handleEditTitle}
            onToggleFavorite={handleToggleFavorite}
            onDelete={handleDelete}
            onGenerateMore={handleGenerateMore}
          />
        </div>
      )}

      {mode === null && !marketOpen && themes.length === 0 && (
        <div className="flex items-center justify-center gap-3 rounded-md border border-dashed border-border p-10 font-sans text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          Escolha um modo para começar a gerar temas.
        </div>
      )}
    </div>
  );
}