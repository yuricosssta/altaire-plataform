// src/components/themes/calendar/ThemeBalancePanel.tsx
'use client';

import { useMemo, useState } from 'react';
import { AlertTriangle, BarChart3, Loader2, RefreshCw, Save, Scale, SlidersHorizontal, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import type { CalendarThemeVersion, RebalanceResult, Theme } from '@/lib/dto/themes.schema';
import type { EditorialCalendar } from '@/lib/dto/editorial.schema';
import { computeBalanceFromAssignments } from '@/lib/mocks/themes.mock';
import { JOURNEY_META, SIMULATE_PRESETS } from '@/lib/constants/themes';
import { RETINA_META } from '@/lib/constants/calendar';
import { themesService } from '@/lib/services/themesService';
import { CalendarVersionDialog } from './CalendarVersionDialog';

interface ThemeBalancePanelProps {
  projectId: string;
  calendarId: string;
  calendar: EditorialCalendar;
  slots: { calendarItemId: string; theme: Theme }[];
  onApplyResult: (result: RebalanceResult) => void;
}

export function ThemeBalancePanel({
  projectId,
  calendarId,
  calendar,
  slots,
  onApplyResult,
}: ThemeBalancePanelProps) {
  const [working, setWorking] = useState<'rebalance' | 'simulate' | 'save' | null>(null);
  const [simulatePreset, setSimulatePreset] = useState(SIMULATE_PRESETS[0].id);
  const [versionOpen, setVersionOpen] = useState(false);
  const [versions, setVersions] = useState<CalendarThemeVersion[]>([]);

  const report = useMemo(() => computeBalanceFromAssignments(calendar, slots), [calendar, slots]);

  const handleRebalance = async () => {
    setWorking('rebalance');
    try {
      const result = await themesService.rebalance(projectId, calendarId);
      onApplyResult(result);
      toast.success('Calendário reequilibrado com sucesso.');
    } catch (error: any) {
      toast.error(error?.message || 'Falha ao reequilibrar o calendário.');
    } finally {
      setWorking(null);
    }
  };

  const handleSimulate = async () => {
    const preset = SIMULATE_PRESETS.find((p) => p.id === simulatePreset);
    if (!preset) return;
    setWorking('simulate');
    try {
      const result = await themesService.simulate(projectId, calendarId, {
        increase: preset.increase,
        decrease: preset.decrease,
        label: preset.label,
      });
      onApplyResult(result);
      toast.success('Cenário simulado aplicado à visualização.');
    } catch (error: any) {
      toast.error(error?.message || 'Falha ao simular o cenário.');
    } finally {
      setWorking(null);
    }
  };

  const handleSaveVersion = async (name: string, objective: any, businessMoment: any) => {
    setWorking('save');
    try {
      const version = await themesService.saveVersion(projectId, calendarId, {
        name,
        objective,
        businessMoment,
      });
      setVersions((prev) => [version, ...prev]);
      setVersionOpen(false);
      toast.success('Versão do calendário salva.');
    } catch (error: any) {
      toast.error(error?.message || 'Falha ao salvar a versão.');
    } finally {
      setWorking(null);
    }
  };

  const loadVersions = async () => {
    try {
      setVersions(await themesService.listVersions(projectId, calendarId));
    } catch {
      setVersions([]);
    }
  };

  const alertIcon = (severity: string) => {
    if (severity === 'high') return 'border-red-500/30 bg-red-500/10 text-red-400';
    if (severity === 'medium') return 'border-amber-500/30 bg-amber-500/10 text-amber-400';
    return 'border-border bg-card text-muted-foreground';
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Mapa de calor RETINA */}
        <section className="rounded-md border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-3 border-b border-border pb-4">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h4 className="font-serif text-lg text-foreground">Distribuição RETINA</h4>
          </div>
          <div className="space-y-3">
            {report.retina.map((item) => (
              <div key={item.retinaType} className="space-y-1">
                <div className="flex items-center justify-between font-sans text-sm">
                  <span className="flex items-center gap-2 font-bold text-foreground">
                    <span className={`h-2 w-2 rounded-full ${RETINA_META[item.retinaType].dotClass}`} />
                    {RETINA_META[item.retinaType].label}
                  </span>
                  <span className="text-muted-foreground">
                    {item.count} tema(s) · {item.share}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-md border border-border bg-background">
                  <div
                    className={`h-full transition-all duration-700 ${RETINA_META[item.retinaType].barClass}`}
                    style={{ width: `${item.share}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 border-t border-border pt-3 font-sans text-xs text-muted-foreground">
            {report.filledSlots} de {report.totalSlots} slots preenchidos neste período.
          </p>
        </section>

        {/* Equilíbrio da jornada */}
        <section className="rounded-md border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-3 border-b border-border pb-4">
            <Scale className="h-5 w-5 text-primary" />
            <h4 className="font-serif text-lg text-foreground">Equilíbrio da Jornada</h4>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {report.journey.map((item) => (
              <div
                key={item.journeyStage}
                className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2"
              >
                <span
                  className={`rounded border px-2 py-0.5 font-sans text-[11px] font-bold ${JOURNEY_META[item.journeyStage].badgeClass}`}
                >
                  {JOURNEY_META[item.journeyStage].label}
                </span>
                <span className="font-sans text-sm font-bold text-foreground">{item.count}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2 border-t border-border pt-3">
            {report.alerts.map((alert, index) => (
              <div
                key={index}
                className={`flex items-start gap-2 rounded-md border px-3 py-2 font-sans text-xs ${alertIcon(alert.severity)}`}
              >
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{alert.message}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Ações */}
      <section className="rounded-md border border-border bg-card p-5">
        <div className="mb-4 flex items-center gap-3 border-b border-border pb-4">
          <Sparkles className="h-5 w-5 text-primary" />
          <h4 className="font-serif text-lg text-foreground">Ajustes, simulação e versões</h4>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <button
            type="button"
            onClick={() => void handleRebalance()}
            disabled={working !== null}
            className="flex items-center gap-2 rounded-md bg-primary px-5 py-2 font-sans text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {working === 'rebalance' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <SlidersHorizontal className="h-4 w-4" />
            )}
            Reequilibrar calendário
          </button>

          <div className="flex items-end gap-2">
            <div className="space-y-1">
              <label className="font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Simular outro cenário
              </label>
              <select
                value={simulatePreset}
                onChange={(e) => setSimulatePreset(e.target.value)}
                className="w-72 rounded-md border border-border bg-background px-3 py-2 font-sans text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {SIMULATE_PRESETS.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={() => void handleSimulate()}
              disabled={working !== null}
              className="flex items-center gap-2 rounded-md border border-border px-4 py-2 font-sans text-sm font-bold text-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
            >
              {working === 'simulate' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Simular
            </button>
          </div>

          <button
            type="button"
            onClick={() => setVersionOpen(true)}
            disabled={working !== null}
            className="ml-auto flex items-center gap-2 rounded-md border border-primary/30 bg-primary/10 px-5 py-2 font-sans text-sm font-bold text-primary transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            Salvar versão do calendário com temas
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void loadVersions()}
            className="rounded-md px-2 py-1 font-sans text-xs font-bold text-muted-foreground transition-colors hover:text-primary"
          >
            Ver versões salvas
          </button>
          {versions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {versions.map((version) => (
                <span
                  key={version.id}
                  className="rounded-md border border-border bg-background px-2.5 py-1 font-sans text-xs text-muted-foreground"
                  title={`${version.period.startDate.toLocaleDateString('pt-BR')} → ${version.period.endDate.toLocaleDateString('pt-BR')}`}
                >
                  {version.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      <CalendarVersionDialog
        open={versionOpen}
        onOpenChange={setVersionOpen}
        onSave={handleSaveVersion}
        saving={working === 'save'}
      />
    </div>
  );
}