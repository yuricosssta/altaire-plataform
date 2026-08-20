// src/app/api/editorial/projects/[projectId]/themes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { proxyEditorialRequest } from '../../../_proxy';
import { GenerationRequestSchema, ThemeSchema } from '@/lib/dto/themes.schema';
import { mockGenerateThemes, mockFilterLibrary } from '@/lib/mocks/themes.mock';

interface RouteContext {
  params: Promise<{ projectId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { projectId } = await params;
  const search = request.nextUrl.searchParams;

  const result = await proxyEditorialRequest(
    request,
    `/projects/${projectId}/themes?${search.toString()}`,
  );

  if (result.ok) {
    return NextResponse.json(result.data);
  }

  const fallback = mockFilterLibrary(projectId, {
    origin: search.get('origin') || undefined,
    retinaType: search.get('retinaType') || undefined,
    journey: search.get('journey') || undefined,
    status: search.get('status') || undefined,
    pillar: search.get('pillar') || undefined,
    q: search.get('q') || undefined,
  });
  const parsed = ThemeSchema.array().safeParse(fallback);
  return NextResponse.json(parsed.success ? parsed.data : fallback);
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const { projectId } = await params;

  const body = await request.json().catch(() => null);
  const parsed = GenerationRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Parâmetros de geração de temas inválidos.', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const result = await proxyEditorialRequest(request, `/projects/${projectId}/themes/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(parsed.data),
  });

  if (result.ok) {
    return NextResponse.json(result.data, { status: 201 });
  }

  const fallback = mockGenerateThemes(projectId, parsed.data);
  return NextResponse.json(fallback, { status: 201 });
}