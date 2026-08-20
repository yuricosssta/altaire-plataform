// src/app/api/editorial/projects/[projectId]/themes/bulk-status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { proxyEditorialRequest } from '../../../../_proxy';
import { BulkStatusSchema, ThemeSchema } from '@/lib/dto/themes.schema';
import { mockBulkStatus } from '@/lib/mocks/themes.mock';

interface RouteContext {
  params: Promise<{ projectId: string }>;
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const { projectId } = await params;

  const body = await request.json().catch(() => null);
  const parsed = BulkStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Payload de atualização em lote inválido.', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const result = await proxyEditorialRequest(request, `/projects/${projectId}/themes/bulk-status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(parsed.data),
  });

  if (result.ok) {
    return NextResponse.json(result.data, { status: 201 });
  }

  const fallback = mockBulkStatus(projectId, parsed.data.themeIds, parsed.data.status);
  const validated = ThemeSchema.array().safeParse(fallback);
  return NextResponse.json(validated.success ? validated.data : fallback, { status: 201 });
}