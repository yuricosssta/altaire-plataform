// src/app/api/editorial/versions/[versionId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { proxyEditorialRequest } from '../../_proxy';
import { mockPatchVersion, mockVersionById } from '@/lib/mocks/editorial.mock';
import { EditorialVersionUpdateSchema, EditorialVersionSchema } from '@/lib/dto/editorial.schema';

interface RouteContext {
  params: Promise<{ versionId: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { versionId } = await params;

  const body = await request.json().catch(() => null);
  const parsed = EditorialVersionUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Payload inválido.', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const result = await proxyEditorialRequest(request, `/versions/${versionId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(parsed.data),
  });

  if (result.ok) {
    return NextResponse.json(result.data);
  }

  const source = mockVersionById(versionId);
  if (!source) {
    return NextResponse.json({ error: 'Versão não encontrada.' }, { status: 404 });
  }

  const fallback = mockPatchVersion(source, parsed.data);
  const validated = EditorialVersionSchema.safeParse(fallback);
  return NextResponse.json(validated.success ? validated.data : fallback);
}