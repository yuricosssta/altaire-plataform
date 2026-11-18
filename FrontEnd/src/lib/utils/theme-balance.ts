import type { RetinaType } from '@/lib/dto/editorial.schema';
import type { JourneyStage } from '@/lib/dto/themes.schema';

interface RetinaItem {
  retinaType: RetinaType;
  count: number;
  share: number;
}

interface JourneyItem {
  journeyStage: JourneyStage;
  count: number;
}

interface AlertItem {
  severity: 'high' | 'medium' | 'low' | string;
  message: string;
}

export interface BalanceReport {
  retina: RetinaItem[];
  journey: JourneyItem[];
  alerts: AlertItem[];
  filledSlots: number;
  totalSlots: number;
}

const ALL_RETINA: RetinaType[] = [
  'relacionamento',
  'engajamento',
  'transformacao',
  'interacao',
  'nivel_consciencia',
  'autoridade',
];

const ALL_JOURNEY: JourneyStage[] = [
  'descoberta',
  'consideracao',
  'conversao',
  'experiencia',
  'compartilhamento',
];

export function computeBalanceFromAssignments(
  calendar: any,
  items: { calendarItemId: string; theme: any }[],
): BalanceReport {
  const dayItems: any[] = Array.isArray(calendar?.slots) && calendar.slots.length > 0
    ? calendar.slots
    : (calendar?.days || []).flatMap((d: any) => d?.items || []);

  const totalSlots = dayItems.length || items.length;
  const themeBySlot = new Map(
    items.map((entry) => [String(entry.calendarItemId), entry.theme]),
  );

  const retinaCounts = new Map<RetinaType, number>();
  ALL_RETINA.forEach((r) => retinaCounts.set(r, 0));

  const journeyCounts = new Map<JourneyStage, number>();
  ALL_JOURNEY.forEach((j) => journeyCounts.set(j, 0));

  let filledSlots = 0;

  for (const slot of dayItems) {
    const slotId = String(slot.id || slot._id || '');
    const assigned = themeBySlot.get(slotId);
    const hasTheme = Boolean(assigned || slot.themeId || slot.theme || slot.mainTheme);
    if (hasTheme) filledSlots++;

    const rawRetina = String(
      assigned?.retinaType || slot.retinaType || slot.retinaBadge || '',
    ).toLowerCase() as RetinaType;
    if (retinaCounts.has(rawRetina)) {
      retinaCounts.set(rawRetina, (retinaCounts.get(rawRetina) || 0) + 1);
    }

    const journey = assigned?.journeyStage as JourneyStage | undefined;
    if (journey && journeyCounts.has(journey)) {
      journeyCounts.set(journey, (journeyCounts.get(journey) || 0) + 1);
    }
  }

  const denominator = totalSlots || 1;
  const retina: RetinaItem[] = ALL_RETINA.map((retinaType) => {
    const count = retinaCounts.get(retinaType) || 0;
    return {
      retinaType,
      count,
      share: Math.round((count / denominator) * 100),
    };
  });

  const journey: JourneyItem[] = ALL_JOURNEY.map((journeyStage) => ({
    journeyStage,
    count: journeyCounts.get(journeyStage) || 0,
  }));

  const alerts: AlertItem[] = [];
  if (totalSlots > filledSlots) {
    alerts.push({
      severity: 'medium',
      message: `${totalSlots - filledSlots} slot(s) aguardando atribuição de tema.`,
    });
  }
  const missingRetina = retina.filter((r) => r.count === 0);
  if (missingRetina.length > 0 && totalSlots > 0) {
    alerts.push({
      severity: 'low',
      message: `Categorias RETINA sem distribuição: ${missingRetina.map((r) => r.retinaType).join(', ')}.`,
    });
  }

  return {
    retina,
    journey,
    alerts,
    filledSlots,
    totalSlots,
  };
}
