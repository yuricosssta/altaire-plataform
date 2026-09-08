import { NextRequest, NextResponse } from 'next/server';
import { proxyEditorialRequest } from '../../../_proxy';
import { mockCalendarSlots } from '@/lib/mocks/scripts.mock';
import type { ScriptFormat } from '@/lib/dto/editorial.schema';

export async function GET(request: NextRequest, { params }: { params: Promise<{ projectId: string; format: string }> }) {
  const { projectId, format } = await params;
  const result = await proxyEditorialRequest(request, `/projects/${projectId}/scripts/slots/${format}`);
  if (result.ok) return NextResponse.json(result.data);

  const slots = mockCalendarSlots[format as ScriptFormat];
  if (!slots) return NextResponse.json([], { status: 200 });
  return NextResponse.json(slots);
}