// src/app/api/editorial/versions/[versionId]/mapa/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { proxyEditorialRequest } from '../../../_proxy';
import { mockMapa, mockVersionById } from '@/lib/mocks/editorial.mock';
import { EditorialMapaSchema } from '@/lib/dto/editorial.schema';

interface RouteContext {
  params: Promise<{ versionId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { versionId } = await params;

  const result = await proxyEditorialRequest(request, `/versions/${versionId}/mapa`);

  if (result.ok) {
    return NextResponse.json(result.data);
  }

  const version = mockVersionById(versionId);
  const fallback = version ? { ...mockMapa, versionId, versionNumber: version.versionNumber, name: version.name } : mockMapa;
  const parsed = EditorialMapaSchema.safeParse(fallback);
  return NextResponse.json(parsed.success ? parsed.data : fallback);
}