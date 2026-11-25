import { NextRequest, NextResponse } from 'next/server';
import { proxyEditorialRequest } from '@/app/api/editorial/_proxy';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params;
  const result = await proxyEditorialRequest(
    request,
    `/projects/${projectId}/versions`,
  );

  if ('ok' in result) {
    const versions = ((result.data as any[]) || []).map((v: any) => ({
      ...v,
      id: v.id || v._id,
      createdAt: v.createdAt ? new Date(v.createdAt) : undefined,
      updatedAt: v.updatedAt ? new Date(v.updatedAt) : undefined,
    }));
    return NextResponse.json(versions);
  }

  return NextResponse.json(result, { status: (result as any)?.status || 502 });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params;
  const body = await request.json().catch(() => null);
  const result = await proxyEditorialRequest(
    request,
    `/projects/${projectId}/versions`,
    { method: 'POST', body },
  );

  if ('ok' in result) {
    const v = result.data as any;
    return NextResponse.json(
      {
        ...v,
        id: v.id || v._id,
        createdAt: v.createdAt ? new Date(v.createdAt) : undefined,
        updatedAt: v.updatedAt ? new Date(v.updatedAt) : undefined,
      },
      { status: 201 },
    );
  }

  return NextResponse.json(result, { status: (result as any)?.status || 502 });
}
