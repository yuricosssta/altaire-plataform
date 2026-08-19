// src/components/editorial/calendar/CalendarManager.tsx
'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CalendarDays,
  Plus,
  Loader2,
  Edit2,
  Copy,
  Archive,
  RotateCcw,
  Check,
  X,
  Sparkles,
  CalendarRange,
} from 'lucide-react';
import { toast } from 'sonner';
import type { EditorialCalendar } from '@/lib/dto/editorial.schema';
import { editorialService } from '@/lib/services/editorialService';
import { OBJECTIVE_META, PERIOD_META } from '@/lib/constants/calendar';

interface CalendarManagerProps {
  projectId: string;
}

export function CalendarManager({ projectId }: CalendarManagerProps) {
  const [calendars, setCalendars] = useState<EditorialCalendar[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const loadCalendars = useCallback(async () => {
    try {
      const data = await editorialService.listCalendars(projectId);
      setCalendars(data);
    } catch (error: any) {
      toast.error(error?.message || 'Falha ao carregar os calendários.');
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadCalendars();
  }, [loadCalendars]);

  const handleDuplicate = async (id: string) => {
    try {
      const duplicated = await editorialService.duplicateCalendar(id);
      setCalendars((prev) => [duplicated, ...prev]);
      toast.success('Calendário duplicado para o mesmo período.');
    } catch (error: any) {
      toast.error(error?.message || 'Falha ao duplicar o calendário.');
    }
  };

  const handleArchiveToggle = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'archived' : 'active';
    try {
      const updated = await editorialService.updateCalendar(id, { status: nextStatus });
      setCalendars((prev) => prev.map((calendar) => (calendar.id === id ? updated : calendar)));
      toast.success(
        nextStatus === 'archived' ? 'Calendário arquivado.' : 'Calendário restaurado.',
      );
    } catch (error: any) {
      toast.error(error?.message || 'Falha ao atualizar o calendário.');
    }
  };

  const handleRenameStart = (calendar: EditorialCalendar) => {
    setEditingId(calendar.id);
    setEditingName(calendar.name);
  };

  const handleRenameCancel = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleRenameSubmit = async (id: string) => {
    if (!editingName.trim()) return;
    try {
      const updated = await editorialService.updateCalendar(id, { name: editingName.trim() });
      setCalendars((prev) => prev.map((calendar) => (calendar.id === id ? updated : calendar)));
      toast.success('Nome do calendário atualizado.');
      handleRenameCancel();
    } catch (error: any) {
      toast.error(error?.message || 'Falha ao renomear o calendário.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h2 className="font-serif text-2xl text-foreground">Calendários Editoriais</h2>
          <p className="mt-1 font-sans text-sm text-muted-foreground">
            Planeje e revise a execução de conteúdo do período.
          </p>
        </div>
        <Link
          href={`/dashboard/editorial/${projectId}/calendario-editorial/novo`}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 font-sans text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Novo Calendário
        </Link>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center gap-3 py-10 font-sans text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          Carregando calendários...
        </div>
      )}

      {!isLoading && calendars.length === 0 && (
        <div className="rounded-md border border-border bg-card p-10 text-center font-sans text-muted-foreground">
          Nenhum calendário criado ainda. Clique em &quot;Novo Calendário&quot; para começar.
        </div>
      )}

      <div className="space-y-4">
        {calendars.map((calendar) => {
          const capacity = calendar.capacity;
          const capacitySummary = `${capacity.reelsPerWeek} Reels · ${capacity.longVideosPerWeek} vídeos longos · ${capacity.carouselsPerWeek} carrosséis · ${capacity.staticPostsPerWeek} posts estáticos · ${capacity.livesPerWeek} lives/semana · ${capacity.storySequencesPerDay} seq. de stories/dia`;
          const isActive = calendar.status === 'active';
          return (
            <div
              key={calendar.id}
              className={`flex flex-col rounded-md border p-4 transition-all ${
                isActive ? 'border-primary/50 bg-card' : 'border-border bg-background opacity-80'
              }`}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md border ${
                      isActive
                        ? 'border-primary/30 bg-primary/10 text-primary'
                        : 'border-border bg-card text-muted-foreground'
                    }`}
                  >
                    <CalendarDays className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    {editingId === calendar.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRenameSubmit(calendar.id);
                            if (e.key === 'Escape') handleRenameCancel();
                          }}
                          autoFocus
                          className="rounded-md border border-border bg-background px-3 py-1 font-serif text-lg text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        />
                        <button
                          onClick={() => handleRenameSubmit(calendar.id)}
                          className="rounded-md p-2 text-primary transition-colors hover:bg-primary/10"
                          title="Salvar"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={handleRenameCancel}
                          className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
                          title="Cancelar"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <h3 className="font-serif text-lg text-foreground">{calendar.name}</h3>
                        {isActive && (
                          <span className="rounded-md bg-primary/10 px-2 py-0.5 font-sans text-[10px] font-bold uppercase tracking-wider text-primary">
                            Ativo
                          </span>
                        )}
                      </div>
                    )}

                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 font-sans text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CalendarRange className="h-3 w-3" />
                        {PERIOD_META[calendar.period.type].label} ·{' '}
                        {calendar.period.startDate.toLocaleDateString('pt-BR')} →{' '}
                        {calendar.period.endDate.toLocaleDateString('pt-BR')}
                      </span>
                      <span>{OBJECTIVE_META[calendar.objective].label}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 border-t border-border pt-3 lg:border-0 lg:pt-0">
                  {isActive && (
                    <Link
                      href={`/dashboard/editorial/${projectId}/calendario-editorial/${calendar.id}`}
                      className="rounded-md px-3 py-1.5 font-sans text-sm font-bold text-primary transition-colors hover:bg-primary/10"
                    >
                      Abrir Calendário
                    </Link>
                  )}

                  <button
                    onClick={() => handleRenameStart(calendar)}
                    className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
                    title="Renomear"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => handleDuplicate(calendar.id)}
                    className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
                    title="Duplicar"
                  >
                    <Copy className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => handleArchiveToggle(calendar.id, calendar.status)}
                    className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
                    title={isActive ? 'Arquivar' : 'Restaurar'}
                  >
                    {isActive ? (
                      <Archive className="h-4 w-4" />
                    ) : (
                      <RotateCcw className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border pt-3 font-sans text-xs text-muted-foreground">
                <span className="text-foreground/80">{capacitySummary}</span>
                {calendar.reviewSuggestions && calendar.reviewSuggestions.length > 0 && (
                  <span className="flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 font-bold text-primary">
                    <Sparkles className="h-3 w-3" />
                    {calendar.reviewSuggestions.length} sugestões de revisão
                  </span>
                )}
                <span className="ml-auto">
                  Atualizado em {calendar.updatedAt?.toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}