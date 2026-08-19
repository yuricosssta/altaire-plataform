// src/app/api/editorial/projects/[projectId]/onboarding/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { proxyEditorialRequest } from '../../../_proxy';
import { mockCreateVersion, mockMapaFromOnboarding } from '@/lib/mocks/editorial.mock';
import { EditorialOnboardingSchema } from '@/lib/dto/editorial.schema';

interface RouteContext {
  params: Promise<{ projectId: string }>;
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const { projectId } = await params;

  const body = await request.json().catch(() => null);
  const parsed = EditorialOnboardingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Payload do onboarding inválido.', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const result = await proxyEditorialRequest(request, `/projects/${projectId}/onboarding`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(parsed.data),
  });

  if (result.ok) {
    return NextResponse.json(result.data, { status: 201 });
  }

  const version = mockCreateVersion(projectId, `${parsed.data.nicheData.niche} — ${parsed.data.offerData.product}`);
  const mapa = mockMapaFromOnboarding(version, parsed.data);
  return NextResponse.json({ version, mapa }, { status: 201 });
}