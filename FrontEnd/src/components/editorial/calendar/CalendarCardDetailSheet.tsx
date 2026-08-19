// src/components/editorial/calendar/CalendarCardDetailSheet.tsx
'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  CalendarItem,
  CalendarItemUpdate,
  CalendarStatus,
} from '@/lib/dto/editorial.schema';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  FORMAT_META,
  PLATFORM_META,
  RETINA_META,
  RETINA_OBJECTIVE_TEXT,
  STATUS_META,
} from '@/lib/constants/calendar';

interface CalendarCardDetailSheetProps {
  item: CalendarItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (patch: CalendarItemUpdate) => Promise<void>;
}

const inputClassName =
  'w-full rounded-md border border-border bg-background px-3 py-2 font-sans text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary';
const labelClassName = 'font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground';

const STATUS_OPTIONS = Object.keys(STATUS_META) as CalendarStatus[];

export function CalendarCardDetailSheet({
  item,
  open,
  onOpenChange,
  onSave,
}: CalendarCardDetailSheetProps) {
  const [provisionalName, setProvisionalName] = useState('');
  const [theme, setTheme] = useState('');
  const [painDesireObjection, setPainDesireObjection] = useState('');
  const [suggestedTime, setSuggestedTime] = useState('');
  const [pillar, setPillar] = useState('');
  const [referenceUrl, setReferenceUrl] = useState('');
  const [observations, setObservations] = useState('');
  const [status, setStatus] = useState<CalendarStatus>('planned');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!item) return;
    setProvisionalName(item.provisionalName || '');
    setTheme(item.theme || '');
    setPainDesireObjection(item.painDesireObjection || '');
    setSuggestedTime(item.suggestedTime || '');
    setPillar(item.pillar || '');
    setReferenceUrl(item.referenceUrl || '');
    setObservations(item.observations || '');
    setStatus(item.status);
  }, [item]);

  if (!item) return null;

  const formatMeta = FORMAT_META[item.format];
  const FormatIcon = formatMeta.icon;
  const retinaMeta = RETINA_META[item.retinaType];
  const statusMeta = STATUS_META[item.status];

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({
        provisionalName,
        theme,
        painDesireObjection,
        suggestedTime,
        pillar,
        referenceUrl,
        observations,
        status,
      });
      toast.success('Card atualizado.');
    } catch (error: any) {
      toast.error(error?.message || 'Falha ao salvar o card.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="font-serif text-xl">Detalhe do Conteúdo</SheetTitle>
          <SheetDescription>
            {format(item.date, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })} ·{' '}
            {item.suggestedTime}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Resumo estático */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 font-sans text-xs font-bold text-foreground">
              <FormatIcon className="h-3.5 w-3.5 text-primary" />
              {formatMeta.label}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-sans text-xs font-bold ${retinaMeta.badgeClass}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${retinaMeta.dotClass}`} />
              {retinaMeta.label}
            </span>
            <span
              className={`rounded-md border px-2.5 py-1 font-sans text-xs font-bold ${statusMeta.badgeClass}`}
            >
              {statusMeta.label}
            </span>
            <span className="rounded-md border border-border bg-background px-2.5 py-1 font-sans text-xs font-bold text-foreground">
              {item.platforms.map((platform) => PLATFORM_META[platform]).join(', ')}
            </span>
          </div>

          <div className="rounded-md border border-border bg-background p-3">
            <p className={labelClassName}>Objetivo estratégico</p>
            <p className="mt-1 font-sans text-sm text-foreground">
              {item.strategicObjective || RETINA_OBJECTIVE_TEXT[item.retinaType]}
            </p>
            <p className="mt-2 font-sans text-xs text-muted-foreground">{item.objective}</p>
          </div>

          {/* Campos editáveis */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className={labelClassName}>Nome provisório</label>
              <input
                value={provisionalName}
                onChange={(e) => setProvisionalName(e.target.value)}
                className={inputClassName}
                placeholder="Ex: Reel — os 3 erros que travam a leitura de gráfico"
              />
            </div>

            <div className="space-y-2">
              <label className={labelClassName}>Tema principal</label>
              <input
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className={inputClassName}
                placeholder="Defina o tema deste conteúdo"
              />
            </div>

            <div className="space-y-2">
              <label className={labelClassName}>Dor, desejo ou objeção atacada</label>
              <textarea
                value={painDesireObjection}
                onChange={(e) => setPainDesireObjection(e.target.value)}
                rows={2}
                className={`${inputClassName} resize-none`}
                placeholder="Qual dor, desejo ou objeção este conteúdo ataca?"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={labelClassName}>Horário sugerido</label>
                <input
                  type="time"
                  value={suggestedTime}
                  onChange={(e) => setSuggestedTime(e.target.value)}
                  className={inputClassName}
                />
              </div>
              <div className="space-y-2">
                <label className={labelClassName}>Status de execução</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as CalendarStatus)}
                  className={inputClassName}
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {STATUS_META[option].label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className={labelClassName}>Pilar editorial</label>
              <input
                value={pillar}
                onChange={(e) => setPillar(e.target.value)}
                className={inputClassName}
                placeholder="Pilar ao qual este conteúdo pertence"
              />
            </div>

            <div className="space-y-2">
              <label className={labelClassName}>Link de referência / inspiração</label>
              <input
                value={referenceUrl}
                onChange={(e) => setReferenceUrl(e.target.value)}
                className={inputClassName}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <label className={labelClassName}>Observações</label>
              <textarea
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                rows={3}
                className={`${inputClassName} resize-none`}
                placeholder="Anotações de produção, briefing, próximos passos..."
              />
            </div>
          </div>
        </div>

        <SheetFooter className="mt-8">
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-md bg-primary px-6 py-2 font-sans text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Salvar
          </button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}