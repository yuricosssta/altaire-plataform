// src/components/themes/ThemeResultTable.tsx
'use client';

import { useState } from 'react';
import { Check, Loader2, Pencil, Sparkles, Star, Trash2, X } from 'lucide-react';
import type { Theme } from '@/lib/dto/themes.schema';
import { CONSCIOUSNESS_META, JOURNEY_META, ORIGIN_META, THEME_STATUS_META } from '@/lib/constants/themes';
import { FORMAT_META, PLATFORM_META, RETINA_META } from '@/lib/constants/calendar';

interface ThemeResultTableProps {
  themes: Theme[];
  selectable?: boolean;
  selected?: Set<string>;
  onSelectionChange?: (next: Set<string>) => void;
  onEditTitle?: (theme: Theme, title: string) => Promise<void> | void;
  onToggleFavorite?: (theme: Theme) => Promise<void> | void;
  onDelete?: (theme: Theme) => Promise<void> | void;
  onGenerateMore?: (theme: Theme) => Promise<void> | void;
  emptyLabel?: string;
}

export function ThemeResultTable({
  themes,
  selectable = false,
  selected,
  onSelectionChange,
  onEditTitle,
  onToggleFavorite,
  onDelete,
  onGenerateMore,
  emptyLabel = 'Nenhum tema gerado ainda.',
}: ThemeResultTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const startEdit = (theme: Theme) => {
    setEditingId(theme.id);
    setEditingTitle(theme.title);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingTitle('');
  };

  const submitEdit = async (theme: Theme) => {
    if (!editingTitle.trim()) return;
    setBusyId(theme.id);
    try {
      await onEditTitle?.(theme, editingTitle.trim());
      cancelEdit();
    } finally {
      setBusyId(null);
    }
  };

  const toggleSelection = (themeId: string) => {
    if (!selected || !onSelectionChange) return;
    const next = new Set(selected);
    if (next.has(themeId)) next.delete(themeId);
    else next.add(themeId);
    onSelectionChange(next);
  };

  if (themes.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border p-10 text-center font-sans text-sm text-muted-foreground">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full min-w-max text-left">
        <thead>
          <tr className="border-b border-border bg-background/60">
            {selectable && <th className="w-10 px-3 py-3" />}
            <th className="px-4 py-3 font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Tema
            </th>
            <th className="px-4 py-3 font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Origem
            </th>
            <th className="px-4 py-3 font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Pilar ROMA
            </th>
            <th className="px-4 py-3 font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Tipo RETINA
            </th>
            <th className="px-4 py-3 font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Consciência
            </th>
            <th className="px-4 py-3 font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Jornada
            </th>
            <th className="px-4 py-3 font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Formato
            </th>
            <th className="px-4 py-3 font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Plataforma
            </th>
            <th className="px-4 py-3 font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Ações
            </th>
          </tr>
        </thead>
        <tbody>
          {themes.map((theme) => {
            const originMeta = ORIGIN_META[theme.origin];
            const OriginIcon = originMeta.icon;
            const formatMeta = FORMAT_META[theme.format];
            const FormatIcon = formatMeta.icon;
            const statusMeta = THEME_STATUS_META[theme.status];
            return (
              <tr key={theme.id} className="border-b border-border/60 align-top last:border-0">
                {selectable && (
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={selected?.has(theme.id) || false}
                      onChange={() => toggleSelection(theme.id)}
                      className="h-4 w-4 accent-[#D4AF37]"
                    />
                  </td>
                )}
                <td className="max-w-md px-4 py-3">
                  {editingId === theme.id ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') void submitEdit(theme);
                          if (e.key === 'Escape') cancelEdit();
                        }}
                        autoFocus
                        className="w-full rounded-md border border-border bg-background px-2 py-1 font-sans text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      />
                      <button
                        onClick={() => void submitEdit(theme)}
                        className="rounded-md p-1 text-primary transition-colors hover:bg-primary/10"
                        title="Salvar"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
                        title="Cancelar"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className="font-sans text-sm font-bold text-foreground">{theme.title}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <span
                          className={`rounded px-1.5 py-0.5 font-sans text-[10px] font-bold uppercase tracking-wider ${statusMeta.badgeClass}`}
                        >
                          {statusMeta.label}
                        </span>
                        {theme.sourceContext && (
                          <span className="rounded bg-muted px-1.5 py-0.5 font-sans text-[10px] italic text-muted-foreground">
                            {theme.sourceContext}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 font-sans text-[11px] font-bold ${originMeta.badgeClass}`}
                  >
                    <OriginIcon className="h-3 w-3" />
                    {originMeta.label}
                  </span>
                </td>
                <td className="px-4 py-3 font-sans text-sm text-foreground">{theme.pillar}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded border px-2 py-0.5 font-sans text-[11px] font-bold ${RETINA_META[theme.retinaType].badgeClass}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${RETINA_META[theme.retinaType].dotClass}`}
                    />
                    {RETINA_META[theme.retinaType].label}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded border px-2 py-0.5 font-sans text-[11px] font-bold ${CONSCIOUSNESS_META[theme.consciousnessLevel].badgeClass}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${CONSCIOUSNESS_META[theme.consciousnessLevel].dotClass}`}
                    />
                    {CONSCIOUSNESS_META[theme.consciousnessLevel].label}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded border px-2 py-0.5 font-sans text-[11px] font-bold ${JOURNEY_META[theme.journeyStage].badgeClass}`}
                  >
                    {JOURNEY_META[theme.journeyStage].shortLabel}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1.5 font-sans text-sm text-foreground">
                    <FormatIcon className="h-3.5 w-3.5 text-primary" />
                    {formatMeta.label}
                  </span>
                </td>
                <td className="px-4 py-3 font-sans text-sm text-muted-foreground">
                  {theme.platforms.map((p) => PLATFORM_META[p]).join(', ')}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => startEdit(theme)}
                      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
                      title="Editar título"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => void onToggleFavorite?.(theme)}
                      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-card hover:text-primary"
                      title={theme.status === 'favorite' ? 'Remover favorito' : 'Marcar como favorito'}
                    >
                      <Star
                        className={`h-4 w-4 ${theme.status === 'favorite' ? 'fill-primary text-primary' : ''}`}
                      />
                    </button>
                    <button
                      onClick={() => void onGenerateMore?.(theme)}
                      disabled={busyId === theme.id}
                      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-card hover:text-primary disabled:opacity-50"
                      title="Gerar mais temas na mesma linha"
                    >
                      {busyId === theme.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => void onDelete?.(theme)}
                      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-card hover:text-red-400"
                      title="Excluir tema"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}