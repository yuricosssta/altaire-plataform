import { NextRequest, NextResponse } from 'next/server';
import { proxyEditorialRequest } from '@/app/api/editorial/_proxy';
import { EditorialVersionUpdateSchema } from '@/lib/dto/editorial.schema';
import { error, ERROR_CODES } from '@/lib/api/response';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ versionId: string }> },
) {
  const { versionId } = await params;
  const result = await proxyEditorialRequest(request, `/versions/${versionId}`);

  if ('ok' in result) {
    const data = result.data as any;
    return NextResponse.json({
      ...data,
      id: data.id || data._id,
      createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
    });
  }

  return NextResponse.json(result, { status: 502 });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ versionId: string }> },
) {
  const { versionId } = await params;

  const body = await request.json().catch(() => null);
  const parsed = EditorialVersionUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      error(ERROR_CODES.VALIDATION_ERROR, 'Dados de atualização inválidos.', parsed.error.flatten()),
      { status: 400 },
    );
  }

  const result = await proxyEditorialRequest(request, `/versions/${versionId}`, {
    method: 'PATCH',
    body: parsed.data,
  });

  if ('ok' in result) {
    const data = result.data as any;
    return NextResponse.json({
      ...data,
      id: data.id || data._id,
      createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
    });
  }

  return NextResponse.json(result, { status: 502 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ versionId: string }> },
) {
  const { versionId } = await params;
  const result = await proxyEditorialRequest(request, `/versions/${versionId}`, {
    method: 'DELETE',
  });

  if ('ok' in result) {
    return NextResponse.json(result.data);
  }

  return NextResponse.json(result, { status: 502 });
}