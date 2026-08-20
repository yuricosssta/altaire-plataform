// src/app/api/editorial/projects/[projectId]/themes/[themeId]/generate-more/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { proxyEditorialRequest } from '../../../../../_proxy';
import { GenerateMoreSchema, ThemeSchema } from '@/lib/dto/themes.schema';
import { mockGenerateMore } from '@/lib/mocks/themes.mock';

interface RouteContext {
  params: Promise<{ projectId: string; themeId: string }>;
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const { projectId, themeId } = await params;

  const body = await request.json().catch(() => null);
  const parsed = GenerateMoreSchema.safeParse(body || {});
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Payload de geração adicional inválido.', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const result = await proxyEditorialRequest(
    request,
    `/projects/${projectId}/themes/${themeId}/generate-more`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed.data),
    },
  );

  if (result.ok) {
    return NextResponse.json(result.data, { status: 201 });
  }

  const fallback = mockGenerateMore(projectId, themeId, parsed.data.count);
  const validated = ThemeSchema.array().safeParse(fallback);
  return NextResponse.json(validated.success ? validated.data : fallback, { status: 201 });
}