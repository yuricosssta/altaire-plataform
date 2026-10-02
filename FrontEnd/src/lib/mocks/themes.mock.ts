import type { CalendarItem } from '@/lib/dto/editorial.schema';

export function computeBalanceFromAssignments(_items: CalendarItem[]): any {
  return { total: 0, distributed: 0, remaining: 0 };
}