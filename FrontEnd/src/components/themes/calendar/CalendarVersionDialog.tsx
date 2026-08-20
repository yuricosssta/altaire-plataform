// src/components/themes/calendar/CalendarVersionDialog.tsx
'use client';

import { useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import type { BusinessMoment, ThemeObjective } from '@/lib/dto/themes.schema';
import { BUSINESS_MOMENT_META, THEME_OBJECTIVE_META } from '@/lib/constants/themes';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface CalendarVersionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (name: string, objective: ThemeObjective, businessMoment: BusinessMoment) => Promise<void> | void;
  saving?: boolean;
}

const inputClassName =
  'w-full rounded-md border border-border bg-background px-4 py-2 font-sans text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary';
const labelClassName = 'font-sans text-sm font-bold text-foreground';

export function CalendarVersionDialog({ open, onOpenChange, onSave, saving }: CalendarVersionDialogProps) {
  const [name, setName] = useState('');
  const [objective, setObjective] = useState<ThemeObjective>('warm_up_sales');
  const [businessMoment, setBusinessMoment] = useState<BusinessMoment>('pre_sale');

  const reset = () => {
    setName('');
    setObjective('warm_up_sales');
    setBusinessMoment('pre_sale');
  };

  const submit = () => {
    if (!name.trim()) return;
    void onSave(name.trim(), objective, businessMoment);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Salvar versão do calendário</DialogTitle>
          <DialogDescription>
            Guarde esta distribuição de temas como um modelo replicável para futuros ciclos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className={labelClassName}>Nome da versão</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClassName}
              placeholder="Ex: Calendário — Versão A (Pré-lançamento)"
            />
          </div>
          <div className="space-y-2">
            <label className={labelClassName}>Configuração de objetivo</label>
            <select
              value={objective}
              onChange={(e) => setObjective(e.target.value as ThemeObjective)}
              className={inputClassName}
            >
              {(Object.keys(THEME_OBJECTIVE_META) as ThemeObjective[]).map((key) => (
                <option key={key} value={key}>
                  {THEME_OBJECTIVE_META[key].label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className={labelClassName}>Momento do negócio</label>
            <select
              value={businessMoment}
              onChange={(e) => setBusinessMoment(e.target.value as BusinessMoment)}
              className={inputClassName}
            >
              {(Object.keys(BUSINESS_MOMENT_META) as BusinessMoment[]).map((key) => (
                <option key={key} value={key}>
                  {BUSINESS_MOMENT_META[key].label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <DialogFooter>
          <button
            type="button"
            onClick={() => {
              reset();
              onOpenChange(false);
            }}
            className="rounded-md border border-border px-4 py-2 font-sans text-sm font-bold text-foreground transition-colors hover:bg-muted"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={saving || !name.trim()}
            className="flex items-center gap-2 rounded-md bg-primary px-6 py-2 font-sans text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Salvar versão
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}