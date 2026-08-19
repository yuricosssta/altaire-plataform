// src/app/api/editorial/versions/[versionId]/duplicate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { proxyEditorialRequest } from '../../../_proxy';
import { mockDuplicateVersion, mockVersionById } from '@/lib/mocks/editorial.mock';
import { EditorialVersionSchema } from '@/lib/dto/editorial.schema';

interface RouteContext {
  params: Promise<{ versionId: string }>;
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const { versionId } = await params;

  const result = await proxyEditorialRequest(request, `/versions/${versionId}/duplicate`, {
    method: 'POST',
  });

  if (result.ok) {
    return NextResponse.json(result.data, { status: 201 });
  }

  const source = mockVersionById(versionId);
  if (!source) {
    return NextResponse.json({ error: 'Versão não encontrada.' }, { status: 404 });
  }

  const fallback = mockDuplicateVersion(source);
  const parsed = EditorialVersionSchema.safeParse(fallback);
  return NextResponse.json(parsed.success ? parsed.data : fallback, { status: 201 });
}