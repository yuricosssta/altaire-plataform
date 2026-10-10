import { NextRequest, NextResponse } from 'next/server';
import { proxyEditorialRequest } from '@/app/api/editorial/_proxy';
import { error, ERROR_CODES } from '@/lib/api/response';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ versionId: string }> },
) {
  const { versionId } = await params;
  const result = await proxyEditorialRequest(request, `/versions/${versionId}/duplicate`, {
    method: 'POST',
  });

  if ('ok' in result) {
    const data = result.data as any;
    return NextResponse.json({
      ...data,
      id: data.id || data._id,
      createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
    }, { status: 201 });
  }

  return NextResponse.json(result, { status: 502 });
}