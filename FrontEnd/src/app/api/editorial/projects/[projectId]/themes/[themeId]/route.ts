// src/app/api/editorial/projects/[projectId]/themes/[themeId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { proxyEditorialRequest } from '../../../../_proxy';
import { ThemeSchema, ThemeUpdateSchema } from '@/lib/dto/themes.schema';
import { mockDeleteTheme, mockPatchTheme } from '@/lib/mocks/themes.mock';

interface RouteContext {
  params: Promise<{ projectId: string; themeId: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { projectId, themeId } = await params;

  const body = await request.json().catch(() => null);
  const parsed = ThemeUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Payload do tema inválido.', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const result = await proxyEditorialRequest(request, `/projects/${projectId}/themes/${themeId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(parsed.data),
  });

  if (result.ok) {
    return NextResponse.json(result.data);
  }

  const fallback = mockPatchTheme(projectId, themeId, parsed.data);
  const validated = ThemeSchema.safeParse(fallback);
  return NextResponse.json(validated.success ? validated.data : fallback);
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const { projectId, themeId } = await params;

  const result = await proxyEditorialRequest(request, `/projects/${projectId}/themes/${themeId}`, {
    method: 'DELETE',
  });

  if (result.ok) {
    return NextResponse.json(result.data);
  }

  const ok = mockDeleteTheme(projectId, themeId);
  if (!ok) {
    return NextResponse.json({ error: 'Tema não encontrado.' }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}