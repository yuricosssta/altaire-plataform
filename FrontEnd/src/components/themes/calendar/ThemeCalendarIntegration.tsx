// src/components/themes/calendar/ThemeCalendarIntegration.tsx
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  BarChart3,
  CalendarDays,
  GripVertical,
  Loader2,
  Scale,
  Search,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import type { EditorialCalendar } from '@/lib/dto/editorial.schema';
import type { RebalanceResult, SlotSuggestion, Theme } from '@/lib/dto/themes.schema';
import { editorialService } from '@/lib/services/editorialService';
import { themesService } from '@/lib/services/themesService';
import { FORMAT_META, PLATFORM_META, RETINA_META } from '@/lib/constants/calendar';
import { CONSCIOUSNESS_META, JOURNEY_META, ORIGIN_META } from '@/lib/constants/themes';
import { CalendarSlotSuggestions } from './CalendarSlotSuggestions';
import { ThemeBalancePanel } from './ThemeBalancePanel';

interface ThemeCalendarIntegrationProps {
  projectId: string;
}

export function ThemeCalendarIntegration({ projectId }: ThemeCalendarIntegrationProps) {
  const [calendars, setCalendars] = useState<EditorialCalendar[]>([]);
  const [calendarId, setCalendarId] = useState<string>('');
  const [calendar, setCalendar] = useState<EditorialCalendar | null>(null);
  const [library, setLibrary] = useState<Theme[]>([]);
  const [suggestions, setSuggestions] = useState<SlotSuggestion[]>([]);
  const [assignments, setAssignments] = useState<Map<string, Theme>>(new Map());
  const [librarySearch, setLibrarySearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [view, setView] = useState<'assign' | 'balance'>('assign');

  useEffect(() => {
    let active = true;
    editorialService
      .listCalendars(projectId)
      .then((data) => {
        if (!active) return;
        const sorted = data.filter((c) => c.status === 'active');
        setCalendars(sorted);
        if (sorted.length > 0 && !sorted.some((c) => c.id === calendarId)) {
          setCalendarId(sorted[0].id);
        }
      })
      .catch(() => {
        if (active) toast.error('Falha ao carregar os calendários do projeto.');
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const loadCalendarData = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const [cal, lib, sugg] = await Promise.all([
        editorialService.getCalendar(id),
        themesService.listLibrary(projectId),
        themesService.getCalendarSuggestions(projectId, { calendarId: id }),
      ]);
      setCalendar(cal);
      setLibrary(lib);
      setSuggestions(sugg);
      setAssignments(new Map());
    } catch (error: any) {
      toast.error(error?.message || 'Falha ao carregar o calendário e os temas.');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (calendarId) {
      void loadCalendarData(calendarId);
    }
  }, [calendarId, loadCalendarData]);

  const suggestionsByItem = useMemo(() => {
    const map = new Map<string, Theme[]>();
    for (const slot of suggestions) {
      map.set(slot.calendarItemId, slot.suggestions);
    }
    return map;
  }, [suggestions]);

  const recommendedThemes = useMemo(() => {
    const seen = new Set<string>();
    const out: Theme[] = [];
    for (const themes of suggestionsByItem.values()) {
      for (const theme of themes) {
        if (seen.has(theme.id)) continue;
        seen.add(theme.id);
        out.push(theme);
      }
    }
    return out;
  }, [suggestionsByItem]);

  const filteredLibrary = useMemo(() => {
    const q = librarySearch.trim().toLowerCase();
    if (!q) return library;
    return library.filter((theme) => theme.title.toLowerCase().includes(q));
  }, [library, librarySearch]);

  const slots = useMemo(
    () => Array.from(assignments.entries()).map(([calendarItemId, theme]) => ({ calendarItemId, theme })),
    [assignments],
  );

  const assign = async (itemId: string, theme: Theme) => {
    setBusyId(itemId);
    setAssignments((prev) => new Map(prev).set(itemId, theme));
    try {
      await themesService.assignTheme(projectId, calendarId, {
        calendarItemId: itemId,
        themeId: theme.id,
      });
    } catch {
      // Estado local é a fonte de verdade na sessão; erro silencioso.
    } finally {
      setBusyId(null);
    }
  };

  const unassign = (itemId: string) => {
    setAssignments((prev) => {
      const next = new Map(prev);
      next.delete(itemId);
      return next;
    });
  };

  const applyResult = (result: RebalanceResult) => {
    setAssignments(new Map(result.slots.map((slot) => [slot.calendarItemId, slot.theme])));
  };

  const handleDragStart = (theme: Theme, event: React.DragEvent) => {
    event.dataTransfer.setData('text/plain', theme.id);
    event.dataTransfer.effectAllowed = 'copy';
    setDragId(theme.id);
  };

  const handleDrop = (itemId: string, event: React.DragEvent) => {
    event.preventDefault();
    setDropTargetId(null);
    const themeId = event.dataTransfer.getData('text/plain');
    const theme = library.find((t) => t.id === themeId);
    if (theme) void assign(itemId, theme);
  };

  if (loading && !calendar) {
    return (
      <div className="flex items-center justify-center gap-3 rounded-md border border-border bg-card p-12 font-sans text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        Carregando integração com o calendário...
      </div>
    );
  }

  if (!loading && calendars.length === 0) {
    return (
      <div className="rounded-md border border-border bg-card p-10 text-center font-sans text-sm text-muted-foreground">
        Nenhum calendário ativo encontrado. Crie um calendário na aba &quot;Calendário&quot; da
        Função 01 antes de integrar os temas.
      </div>
    );
  }

  if (!calendar) return null;

  return (
    <div className="space-y-6">
      {/* Barra de controle */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            <label className="font-sans text-sm font-bold text-foreground">Calendário</label>
          </div>
          <select
            value={calendarId}
            onChange={(e) => setCalendarId(e.target.value)}
            className="min-w-56 rounded-md border border-border bg-background px-3 py-2 font-sans text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {calendars.map((cal) => (
              <option key={cal.id} value={cal.id}>
                {cal.name} · {cal.period.startDate.toLocaleDateString('pt-BR')} →{' '}
                {cal.period.endDate.toLocaleDateString('pt-BR')}
              </option>
            ))}
          </select>
        </div>
        <div className="flex rounded-md border border-border bg-background p-1">
          <button
            type="button"
            onClick={() => setView('assign')}
            className={`flex items-center gap-1.5 rounded-sm px-3 py-1.5 font-sans text-xs font-bold transition-colors ${
              view === 'assign'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Scale className="h-3.5 w-3.5" />
            Arrastar Temas
          </button>
          <button
            type="button"
            onClick={() => setView('balance')}
            className={`flex items-center gap-1.5 rounded-sm px-3 py-1.5 font-sans text-xs font-bold transition-colors ${
              view === 'balance'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            Equilíbrio & Versões
          </button>
        </div>
      </div>

      {view === 'balance' && (
        <ThemeBalancePanel
          projectId={projectId}
          calendarId={calendarId}
          calendar={calendar}
          slots={slots}
          onApplyResult={applyResult}
        />
      )}

      {view === 'assign' && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
          {/* Coluna esquerda — calendário */}
          <div className="space-y-4 xl:col-span-3">
            {calendar.days.map((day) => (
              <div key={day.date.getTime()} className="rounded-md border border-border bg-card p-4">
                <h4 className="mb-3 flex items-center justify-between border-b border-border pb-2 font-serif text-lg capitalize text-foreground">
                  {format(day.date, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                  <span className="font-sans text-xs font-bold text-muted-foreground">
                    {day.items.length} slot(s)
                  </span>
                </h4>
                <div className="space-y-3">
                  {day.items.map((item) => {
                    const assigned = assignments.get(item.id);
                    const slotSuggestions = suggestionsByItem.get(item.id) || [];
                    const formatMeta = FORMAT_META[item.format];
                    const FormatIcon = formatMeta.icon;
                    const isDropTarget = dropTargetId === item.id;
                    return (
                      <div
                        key={item.id}
                        onDragOver={(event) => {
                          event.preventDefault();
                          event.dataTransfer.dropEffect = 'copy';
                          if (dropTargetId !== item.id) setDropTargetId(item.id);
                        }}
                        onDragLeave={() => {
                          if (dropTargetId === item.id) setDropTargetId(null);
                        }}
                        onDrop={(event) => handleDrop(item.id, event)}
                        className={`rounded-md border p-3 transition-colors ${
                          isDropTarget
                            ? 'border-primary bg-primary/10'
                            : assigned
                              ? 'border-primary/40 bg-background'
                              : 'border-dashed border-border'
                        }`}
                      >
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span className="rounded-md bg-primary/10 px-2 py-0.5 font-sans text-xs font-bold text-primary">
                            {item.suggestedTime}
                          </span>
                          <span className="inline-flex items-center gap-1.5 font-sans text-xs font-bold text-foreground">
                            <FormatIcon className="h-3.5 w-3.5 text-primary" />
                            {formatMeta.label}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-sans text-[10px] font-bold ${RETINA_META[item.retinaType].badgeClass}`}
                          >
                            {RETINA_META[item.retinaType].label}
                          </span>
                          <span className="rounded border border-border bg-card px-1.5 py-0.5 font-sans text-[10px] font-bold text-muted-foreground">
                            {item.platforms.map((p) => PLATFORM_META[p]).join(', ')}
                          </span>
                          <span className="font-sans text-xs italic text-muted-foreground">
                            {item.objective}
                          </span>
                        </div>

                        {assigned ? (
                          <div className="rounded-md border border-primary/20 bg-background p-3">
                            <p className="font-sans text-sm font-bold text-foreground">
                              {assigned.title}
                            </p>
                            <div className="mt-2 flex flex-wrap items-center gap-1.5">
                              <span
                                className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-sans text-[10px] font-bold ${RETINA_META[assigned.retinaType].badgeClass}`}
                              >
                                {RETINA_META[assigned.retinaType].label}
                              </span>
                              <span
                                className={`rounded border px-1.5 py-0.5 font-sans text-[10px] font-bold ${JOURNEY_META[assigned.journeyStage].badgeClass}`}
                              >
                                {JOURNEY_META[assigned.journeyStage].shortLabel}
                              </span>
                              <span
                                className={`rounded border px-1.5 py-0.5 font-sans text-[10px] font-bold ${CONSCIOUSNESS_META[assigned.consciousnessLevel].badgeClass}`}
                              >
                                {CONSCIOUSNESS_META[assigned.consciousnessLevel].label}
                              </span>
                              <span className="rounded border border-border bg-card px-1.5 py-0.5 font-sans text-[10px] font-bold text-muted-foreground">
                                {assigned.platforms.map((p) => PLATFORM_META[p]).join(', ')}
                              </span>
                            </div>
                            {assigned.pillar && (
                              <p className="mt-2 font-sans text-xs text-muted-foreground">
                                <strong className="text-foreground">Pilar:</strong> {assigned.pillar}
                              </p>
                            )}
                            {assigned.sourceContext && (
                              <p className="mt-1 font-sans text-xs italic text-muted-foreground">
                                {assigned.sourceContext}
                              </p>
                            )}
                            <div className="mt-2 flex gap-2 border-t border-border pt-2">
                              <button
                                type="button"
                                onClick={() => unassign(item.id)}
                                className="font-sans text-xs font-bold text-muted-foreground transition-colors hover:text-primary"
                              >
                                Trocar tema
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <CalendarSlotSuggestions
                              suggestions={slotSuggestions}
                              onUse={(theme) => void assign(item.id, theme)}
                              busyId={busyId}
                            />
                            <p className="mt-2 text-center font-sans text-[10px] uppercase tracking-wider text-muted-foreground/60">
                              ou arraste um tema da coluna ao lado
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {day.items.length === 0 && (
                    <p className="rounded-md border border-dashed border-border p-3 text-center font-sans text-xs text-muted-foreground/70">
                      Sem slots de conteúdo neste dia.
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Coluna direita — biblioteca */}
          <div className="space-y-4 xl:col-span-2">
            <div className="rounded-md border border-border bg-card p-4">
              <div className="mb-3 flex items-center justify-between border-b border-border pb-3">
                <div>
                  <h4 className="flex items-center gap-2 font-serif text-lg text-foreground">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Recomendados para o período
                  </h4>
                  <p className="font-sans text-xs text-muted-foreground">
                    Sugestões da IA por tipo de slot, jornada e momento do negócio.
                  </p>
                </div>
              </div>
              <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                {recommendedThemes.map((theme) => (
                  <DraggableThemeCard
                    key={theme.id}
                    theme={theme}
                    dragging={dragId === theme.id}
                    onDragStart={(e) => handleDragStart(theme, e)}
                  />
                ))}
                {recommendedThemes.length === 0 && (
                  <p className="rounded-md border border-dashed border-border p-4 text-center font-sans text-xs text-muted-foreground">
                    Carregue os temas para ver as recomendações.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-md border border-border bg-card p-4">
              <div className="mb-3 space-y-2 border-b border-border pb-3">
                <h4 className="font-serif text-lg text-foreground">Biblioteca de Temas</h4>
                <div className="flex gap-2">
                  <input
                    value={librarySearch}
                    onChange={(e) => setLibrarySearch(e.target.value)}
                    placeholder="Buscar na biblioteca..."
                    className="w-full rounded-md border border-border bg-background px-3 py-2 font-sans text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                  <button
                    type="button"
                    className="rounded-md border border-border px-3 text-foreground transition-colors hover:text-primary"
                  >
                    <Search className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="max-h-96 space-y-2 overflow-y-auto pr-1">
                {filteredLibrary.map((theme) => (
                  <DraggableThemeCard
                    key={theme.id}
                    theme={theme}
                    dragging={dragId === theme.id}
                    onDragStart={(e) => handleDragStart(theme, e)}
                  />
                ))}
                {filteredLibrary.length === 0 && (
                  <p className="rounded-md border border-dashed border-border p-4 text-center font-sans text-xs text-muted-foreground">
                    Nenhum tema encontrado. Gere temas primeiro.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface DraggableThemeCardProps {
  theme: Theme;
  dragging: boolean;
  onDragStart: (event: React.DragEvent) => void;
}

function DraggableThemeCard({ theme, dragging, onDragStart }: DraggableThemeCardProps) {
  const originMeta = ORIGIN_META[theme.origin];
  const formatMeta = FORMAT_META[theme.format];
  const FormatIcon = formatMeta.icon;
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={() => undefined}
      className={`group flex cursor-grab items-start gap-2 rounded-md border border-border bg-background p-3 transition-colors hover:border-primary active:cursor-grabbing ${
        dragging ? 'opacity-50' : ''
      }`}
    >
      <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
      <div className="min-w-0">
        <p className="font-sans text-sm font-bold leading-snug text-foreground">{theme.title}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-sans text-[10px] font-bold ${RETINA_META[theme.retinaType].badgeClass}`}
          >
            {RETINA_META[theme.retinaType].label}
          </span>
          <span
            className={`rounded border px-1.5 py-0.5 font-sans text-[10px] font-bold ${JOURNEY_META[theme.journeyStage].badgeClass}`}
          >
            {JOURNEY_META[theme.journeyStage].shortLabel}
          </span>
          <span className="inline-flex items-center gap-1 rounded border border-border bg-card px-1.5 py-0.5 font-sans text-[10px] font-bold text-muted-foreground">
            <FormatIcon className="h-3 w-3 text-primary" />
            {formatMeta.label}
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-sans text-[10px] font-bold ${originMeta.badgeClass}`}
          >
            {originMeta.label}
          </span>
        </div>
      </div>
    </div>
  );
}