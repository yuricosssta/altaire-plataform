import { NextRequest, NextResponse } from 'next/server';
import { proxyEditorialRequest } from '@/app/api/editorial/_proxy';
import { BulkStatusSchema } from '@/lib/dto/themes.schema';
import { error, ERROR_CODES } from '@/lib/api/response';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params;
  const body = await request.json().catch(() => null);

  const parsed = BulkStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      error(
        ERROR_CODES.VALIDATION_ERROR,
        'Parâmetros de bulk status inválidos.',
        parsed.error.flatten(),
      ),
      { status: 400 },
    );
  }

  const result = await proxyEditorialRequest(
    request,
    `/projects/${projectId}/themes/bulk-status`,
    {
      method: 'POST',
      body: parsed.data,
    },
  );

  if ('ok' in result) {
    return NextResponse.json(result.data);
  }
  return NextResponse.json(result, { status: 502 });
}
