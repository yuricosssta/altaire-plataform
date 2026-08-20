// src/components/themes/ThemeLibrary.tsx
'use client';

import { Fragment, useCallback, useEffect, useState } from 'react';
import { Archive, Loader2, Pencil, RotateCcw, Save, Search, Star, X } from 'lucide-react';
import { toast } from 'sonner';
import type {
  ConsciousnessLevel,
  JourneyStage,
  Theme,
  ThemeFlag,
  ThemeOrigin,
  ThemeStatus,
} from '@/lib/dto/themes.schema';
import type { ContentFormat, Platform, RetinaType } from '@/lib/dto/editorial.schema';
import { CONSCIOUSNESS_META, JOURNEY_META, ORIGIN_META, THEME_FLAG_META, THEME_STATUS_META } from '@/lib/constants/themes';
import { FORMAT_META, PLATFORM_META, RETINA_META } from '@/lib/constants/calendar';
import { themesService } from '@/lib/services/themesService';

interface ThemeLibraryProps {
  projectId: string;
}

const inputClassName =
  'w-full rounded-md border border-border bg-background px-3 py-2 font-sans text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary';
const labelClassName = 'font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground';

const RETINA_TYPES = Object.keys(RETINA_META) as RetinaType[];
const CONSCIOUSNESS_TYPES = Object.keys(CONSCIOUSNESS_META) as ConsciousnessLevel[];
const JOURNEY_STAGES = Object.keys(JOURNEY_META) as JourneyStage[];
const FORMATS = Object.keys(FORMAT_META) as ContentFormat[];
const PLATFORMS = Object.keys(PLATFORM_META) as Platform[];
const ORIGINS = Object.keys(ORIGIN_META) as ThemeOrigin[];
const STATUSES = Object.keys(THEME_STATUS_META) as ThemeStatus[];
const FLAGS = Object.keys(THEME_FLAG_META) as ThemeFlag[];

interface Filters {
  origin?: string;
  retinaType?: string;
  journey?: string;
  status?: string;
  pillar?: string;
  q?: string;
}

export function ThemeLibrary({ projectId }: ThemeLibraryProps) {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pillars, setPillars] = useState<string[]>([]);
  const [filters, setFilters] = useState<Filters>({});
  const [searchInput, setSearchInput] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Partial<Theme>>({});

  const load = useCallback(async (nextFilters: Filters) => {
    setIsLoading(true);
    try {
      const data = await themesService.listLibrary(projectId, nextFilters);
      setThemes(data);
    } catch (error: any) {
      toast.error(error?.message || 'Falha ao carregar a biblioteca de temas.');
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    load(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.origin, filters.retinaType, filters.journey, filters.status, filters.pillar]);

  useEffect(() => {
    themesService
      .detectPillars(projectId)
      .then(setPillars)
      .catch(() => setPillars([]));
  }, [projectId]);

  const setFilter = (key: keyof Filters, value?: string) => {
    setFilters((prev) => {
      const next = { ...prev };
      if (value) next[key] = value;
      else delete next[key];
      return next;
    });
  };

  const applySearch = () => {
    setFilter('q', searchInput.trim() || undefined);
  };

  const startEdit = (theme: Theme) => {
    setEditingId(theme.id);
    setEditing({
      title: theme.title,
      pillar: theme.pillar,
      retinaType: theme.retinaType,
      consciousnessLevel: theme.consciousnessLevel,
      journeyStage: theme.journeyStage,
      format: theme.format,
      platforms: [...theme.platforms],
      status: theme.status,
      flags: theme.flags ? [...theme.flags] : [],
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditing({});
  };

  const saveEdit = async () => {
    if (!editingId) return;
    try {
      const updated = await themesService.updateTheme(projectId, editingId, {
        title: editing.title,
        pillar: editing.pillar,
        retinaType: editing.retinaType,
        consciousnessLevel: editing.consciousnessLevel,
        journeyStage: editing.journeyStage,
        format: editing.format,
        platforms: editing.platforms as Platform[],
        status: editing.status,
        flags: editing.flags,
      });
      setThemes((prev) => prev.map((theme) => (theme.id === editingId ? updated : theme)));
      toast.success('Tema atualizado.');
      cancelEdit();
    } catch (error: any) {
      toast.error(error?.message || 'Falha ao atualizar o tema.');
    }
  };

  const toggleFlag = (flag: ThemeFlag) => {
    setEditing((prev) => {
      const current = prev.flags || [];
      return {
        ...prev,
        flags: current.includes(flag) ? current.filter((f) => f !== flag) : [...current, flag],
      };
    });
  };

  const togglePlatform = (platform: Platform) => {
    setEditing((prev) => {
      const current = prev.platforms || [];
      return {
        ...prev,
        platforms: current.includes(platform)
          ? current.filter((p) => p !== platform)
          : [...current, platform],
      };
    });
  };

  const handleToggleFavorite = async (theme: Theme) => {
    const nextStatus: ThemeStatus = theme.status === 'favorite' ? 'active' : 'favorite';
    const updated = await themesService.updateTheme(projectId, theme.id, { status: nextStatus });
    setThemes((prev) => prev.map((t) => (t.id === theme.id ? updated : t)));
  };

  const handleArchiveToggle = async (theme: Theme) => {
    const nextStatus: ThemeStatus = theme.status === 'archived' ? 'active' : 'archived';
    const updated = await themesService.updateTheme(projectId, theme.id, { status: nextStatus });
    setThemes((prev) => prev.map((t) => (t.id === theme.id ? updated : t)));
    toast.success(nextStatus === 'archived' ? 'Tema arquivado.' : 'Tema restaurado.');
  };

  const selectClassName = `${inputClassName} bg-background`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-3 rounded-md border border-border bg-card p-4">
        <div className="min-w-52 flex-1 space-y-1.5">
          <label className={labelClassName}>Buscar</label>
          <div className="flex gap-2">
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') applySearch();
              }}
              placeholder="Buscar por título do tema..."
              className={inputClassName}
            />
            <button
              type="button"
              onClick={applySearch}
              className="rounded-md border border-border px-3 text-foreground transition-colors hover:text-primary"
              title="Buscar"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className={labelClassName}>Origem</label>
          <select
            value={filters.origin || ''}
            onChange={(e) => setFilter('origin', e.target.value || undefined)}
            className={selectClassName}
          >
            <option value="">Todas</option>
            {ORIGINS.map((origin) => (
              <option key={origin} value={origin}>
                {ORIGIN_META[origin].label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className={labelClassName}>Pilar ROMA</label>
          <select
            value={filters.pillar || ''}
            onChange={(e) => setFilter('pillar', e.target.value || undefined)}
            className={selectClassName}
          >
            <option value="">Todos</option>
            {pillars.map((pillar) => (
              <option key={pillar} value={pillar}>
                {pillar}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className={labelClassName}>Tipo RETINA</label>
          <select
            value={filters.retinaType || ''}
            onChange={(e) => setFilter('retinaType', e.target.value || undefined)}
            className={selectClassName}
          >
            <option value="">Todos</option>
            {RETINA_TYPES.map((type) => (
              <option key={type} value={type}>
                {RETINA_META[type].label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className={labelClassName}>Jornada</label>
          <select
            value={filters.journey || ''}
            onChange={(e) => setFilter('journey', e.target.value || undefined)}
            className={selectClassName}
          >
            <option value="">Todas</option>
            {JOURNEY_STAGES.map((stage) => (
              <option key={stage} value={stage}>
                {JOURNEY_META[stage].label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className={labelClassName}>Status</label>
          <select
            value={filters.status || ''}
            onChange={(e) => setFilter('status', e.target.value || undefined)}
            className={selectClassName}
          >
            <option value="">Todos</option>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {THEME_STATUS_META[status].label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center gap-3 py-10 font-sans text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          Carregando biblioteca de temas...
        </div>
      )}

      {!isLoading && themes.length === 0 && (
        <div className="rounded-md border border-dashed border-border p-10 text-center font-sans text-sm text-muted-foreground">
          Nenhum tema encontrado com os filtros atuais. Gere temas na aba &quot;Gerar Temas&quot; para
          popular sua biblioteca.
        </div>
      )}

      {!isLoading && themes.length > 0 && (
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full min-w-max text-left">
            <thead>
              <tr className="border-b border-border bg-background/60">
                <th className="px-4 py-3 font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">Tema</th>
                <th className="px-4 py-3 font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">Origem</th>
                <th className="px-4 py-3 font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">Pilar ROMA</th>
                <th className="px-4 py-3 font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">RETINA</th>
                <th className="px-4 py-3 font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">Consciência</th>
                <th className="px-4 py-3 font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">Jornada</th>
                <th className="px-4 py-3 font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">Formato</th>
                <th className="px-4 py-3 font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-4 py-3 font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {themes.map((theme) => {
                const originMeta = ORIGIN_META[theme.origin];
                const OriginIcon = originMeta.icon;
                const formatMeta = FORMAT_META[theme.format];
                const FormatIcon = formatMeta.icon;
                const statusMeta = THEME_STATUS_META[theme.status];
                const isEditing = editingId === theme.id;
                return (
                  <FragmentRow
                    key={theme.id}
                    theme={theme}
                    isEditing={isEditing}
                    editing={editing}
                    onEditingChange={setEditing}
                    onStartEdit={startEdit}
                    onCancelEdit={cancelEdit}
                    onSaveEdit={saveEdit}
                    onToggleFavorite={handleToggleFavorite}
                    onArchiveToggle={handleArchiveToggle}
                    onToggleFlag={toggleFlag}
                    onTogglePlatform={togglePlatform}
                    originMeta={originMeta}
                    OriginIcon={OriginIcon}
                    formatMeta={formatMeta}
                    FormatIcon={FormatIcon}
                    statusMeta={statusMeta}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

interface FragmentRowProps {
  theme: Theme;
  isEditing: boolean;
  editing: Partial<Theme>;
  onEditingChange: (patch: Partial<Theme>) => void;
  onStartEdit: (theme: Theme) => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onToggleFavorite: (theme: Theme) => void;
  onArchiveToggle: (theme: Theme) => void;
  onToggleFlag: (flag: ThemeFlag) => void;
  onTogglePlatform: (platform: Platform) => void;
  originMeta: { label: string; badgeClass: string; icon: any };
  OriginIcon: any;
  formatMeta: { label: string; icon: any; time: string };
  FormatIcon: any;
  statusMeta: { label: string; badgeClass: string };
}

function FragmentRow({
  theme,
  isEditing,
  editing,
  onEditingChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onToggleFavorite,
  onArchiveToggle,
  onToggleFlag,
  onTogglePlatform,
  originMeta,
  OriginIcon,
  formatMeta,
  FormatIcon,
  statusMeta,
}: FragmentRowProps) {
  return (
    <Fragment>
      <tr className="border-b border-border/60 align-top last:border-0">
        <td className="max-w-md px-4 py-3">
          <p className="font-sans text-sm font-bold text-foreground">{theme.title}</p>
          {theme.flags && theme.flags.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1.5">
              {theme.flags.map((flag) => (
                <span
                  key={flag}
                  className={`rounded px-1.5 py-0.5 font-sans text-[10px] font-bold uppercase tracking-wider ${THEME_FLAG_META[flag].badgeClass}`}
                >
                  {THEME_FLAG_META[flag].label}
                </span>
              ))}
            </div>
          )}
        </td>
        <td className="px-4 py-3">
          <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 font-sans text-[11px] font-bold ${originMeta.badgeClass}`}>
            <OriginIcon className="h-3 w-3" />
            {originMeta.label}
          </span>
        </td>
        <td className="px-4 py-3 font-sans text-sm text-foreground">{theme.pillar}</td>
        <td className="px-4 py-3">
          <span className={`inline-flex items-center gap-1.5 rounded border px-2 py-0.5 font-sans text-[11px] font-bold ${RETINA_META[theme.retinaType].badgeClass}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${RETINA_META[theme.retinaType].dotClass}`} />
            {RETINA_META[theme.retinaType].label}
          </span>
        </td>
        <td className="px-4 py-3">
          <span className={`inline-flex items-center gap-1.5 rounded border px-2 py-0.5 font-sans text-[11px] font-bold ${CONSCIOUSNESS_META[theme.consciousnessLevel].badgeClass}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${CONSCIOUSNESS_META[theme.consciousnessLevel].dotClass}`} />
            {CONSCIOUSNESS_META[theme.consciousnessLevel].label}
          </span>
        </td>
        <td className="px-4 py-3">
          <span className={`rounded border px-2 py-0.5 font-sans text-[11px] font-bold ${JOURNEY_META[theme.journeyStage].badgeClass}`}>
            {JOURNEY_META[theme.journeyStage].shortLabel}
          </span>
        </td>
        <td className="px-4 py-3">
          <span className="inline-flex items-center gap-1.5 font-sans text-sm text-foreground">
            <FormatIcon className="h-3.5 w-3.5 text-primary" />
            {formatMeta.label}
          </span>
        </td>
        <td className="px-4 py-3">
          <span className={`rounded border px-2 py-0.5 font-sans text-[11px] font-bold ${statusMeta.badgeClass}`}>
            {statusMeta.label}
          </span>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-1">
            <button onClick={() => (isEditing ? onCancelEdit() : onStartEdit(theme))} className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-card hover:text-foreground" title={isEditing ? 'Cancelar' : 'Editar'}>
              {isEditing ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
            </button>
            <button onClick={() => onToggleFavorite(theme)} className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-card hover:text-primary" title="Favoritar">
              <Star className={`h-4 w-4 ${theme.status === 'favorite' ? 'fill-primary text-primary' : ''}`} />
            </button>
            <button onClick={() => onArchiveToggle(theme)} className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-card hover:text-amber-400" title={theme.status === 'archived' ? 'Restaurar' : 'Arquivar'}>
              {theme.status === 'archived' ? <RotateCcw className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
            </button>
          </div>
        </td>
      </tr>
      {isEditing && (
        <tr className="border-b border-border/60 bg-background/40">
          <td colSpan={9} className="px-4 py-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1.5 sm:col-span-2">
                <label className={labelClassName}>Título</label>
                <input
                  value={editing.title || ''}
                  onChange={(e) => onEditingChange({ title: e.target.value })}
                  className={inputClassName}
                />
              </div>
              <div className="space-y-1.5">
                <label className={labelClassName}>Pilar ROMA</label>
                <input
                  value={editing.pillar || ''}
                  onChange={(e) => onEditingChange({ pillar: e.target.value })}
                  className={inputClassName}
                />
              </div>
              <div className="space-y-1.5">
                <label className={labelClassName}>Tipo RETINA</label>
                <select
                  value={editing.retinaType || ''}
                  onChange={(e) => onEditingChange({ retinaType: e.target.value as RetinaType })}
                  className={inputClassName}
                >
                  {RETINA_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {RETINA_META[type].label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className={labelClassName}>Consciência</label>
                <select
                  value={editing.consciousnessLevel || ''}
                  onChange={(e) => onEditingChange({ consciousnessLevel: e.target.value as ConsciousnessLevel })}
                  className={inputClassName}
                >
                  {CONSCIOUSNESS_TYPES.map((level) => (
                    <option key={level} value={level}>
                      {CONSCIOUSNESS_META[level].label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className={labelClassName}>Jornada do cliente</label>
                <select
                  value={editing.journeyStage || ''}
                  onChange={(e) => onEditingChange({ journeyStage: e.target.value as JourneyStage })}
                  className={inputClassName}
                >
                  {JOURNEY_STAGES.map((stage) => (
                    <option key={stage} value={stage}>
                      {JOURNEY_META[stage].label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className={labelClassName}>Formato recomendado</label>
                <select
                  value={editing.format || ''}
                  onChange={(e) => onEditingChange({ format: e.target.value as ContentFormat })}
                  className={inputClassName}
                >
                  {FORMATS.map((format) => (
                    <option key={format} value={format}>
                      {FORMAT_META[format].label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className={labelClassName}>Status</label>
                <select
                  value={editing.status || ''}
                  onChange={(e) => onEditingChange({ status: e.target.value as ThemeStatus })}
                  className={inputClassName}
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {THEME_STATUS_META[status].label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5 sm:col-span-2 lg:col-span-4">
                <label className={labelClassName}>Plataformas</label>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map((platform) => {
                    const active = (editing.platforms || []).includes(platform);
                    return (
                      <label
                        key={platform}
                        className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 font-sans text-sm transition-colors ${
                          active ? 'border-primary bg-primary/10' : 'border-border bg-background'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={active}
                          onChange={() => onTogglePlatform(platform)}
                          className="h-4 w-4 accent-[#D4AF37]"
                        />
                        {PLATFORM_META[platform]}
                      </label>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-1.5 sm:col-span-2 lg:col-span-4">
                <label className={labelClassName}>Marcações estratégicas</label>
                <div className="flex flex-wrap gap-2">
                  {FLAGS.map((flag) => {
                    const active = (editing.flags || []).includes(flag);
                    return (
                      <label
                        key={flag}
                        className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 font-sans text-sm transition-colors ${
                          active ? 'border-primary bg-primary/10' : 'border-border bg-background'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={active}
                          onChange={() => onToggleFlag(flag)}
                          className="h-4 w-4 accent-[#D4AF37]"
                        />
                        {THEME_FLAG_META[flag].label}
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2 border-t border-border pt-4">
              <button
                type="button"
                onClick={onCancelEdit}
                className="rounded-md border border-border px-4 py-1.5 font-sans text-sm font-bold text-foreground transition-colors hover:bg-muted"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={onSaveEdit}
                className="flex items-center gap-2 rounded-md bg-primary px-6 py-1.5 font-sans text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
              >
                <Save className="h-4 w-4" />
                Salvar alterações
              </button>
            </div>
          </td>
        </tr>
      )}
    </Fragment>
  );
}