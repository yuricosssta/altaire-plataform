import { NextRequest, NextResponse } from 'next/server';
import { proxyEditorialRequest } from '@/app/api/editorial/_proxy';
import { EditorialOnboardingSchema } from '@/lib/dto/editorial.schema';
import { error, ERROR_CODES } from '@/lib/api/response';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params;

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json(
      error(ERROR_CODES.VALIDATION_ERROR, 'Corpo da requisição é obrigatório.'),
      { status: 400 },
    );
  }

  const parsed = EditorialOnboardingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      error(ERROR_CODES.VALIDATION_ERROR, 'Dados de onboarding inválidos.', parsed.error.flatten()),
      { status: 400 },
    );
  }

  const result = await proxyEditorialRequest(request, `/projects/${projectId}/onboarding`, {
    method: 'POST',
    body: parsed.data,
  });

  if ('ok' in result) {
    const data = result.data as any;
    return NextResponse.json({
      version: data.version ? {
        ...data.version,
        createdAt: data.version.createdAt ? new Date(data.version.createdAt) : undefined,
        updatedAt: data.version.updatedAt ? new Date(data.version.updatedAt) : undefined,
      } : undefined,
      mapa: data.mapa,
    }, { status: 201 });
  }

  return NextResponse.json(result, { status: 502 });
}