import type { CalendarItem, RetinaType } from '@/lib/dto/editorial.schema';
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
  severity: string;
  message: string;
}

interface BalanceReport {
  retina: RetinaItem[];
  journey: JourneyItem[];
  alerts: AlertItem[];
  filledSlots: number;
  totalSlots: number;
}

export function computeBalanceFromAssignments(
  calendar: unknown,
  items: { calendarItemId: string; theme: unknown }[],
): BalanceReport {
  return {
    retina: [],
    journey: [],
    alerts: [],
    filledSlots: 0,
    totalSlots: 0,
  };
}