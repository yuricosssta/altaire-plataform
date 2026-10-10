import { NextRequest, NextResponse } from 'next/server';
import { proxyEditorialRequest } from '@/app/api/editorial/_proxy';
import { EditorialVersionSchema } from '@/lib/dto/editorial.schema';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params;
  const result = await proxyEditorialRequest(request, `/projects/${projectId}/versions`);

  if ('ok' in result) {
    const versions = ((result.data as any[]) || []).map((v: any) => ({
      ...v,
      id: v.id || v._id,
      createdAt: v.createdAt ? new Date(v.createdAt) : undefined,
      updatedAt: v.updatedAt ? new Date(v.updatedAt) : undefined,
    }));
    return NextResponse.json(versions);
  }

  return NextResponse.json(result, { status: 502 });
}