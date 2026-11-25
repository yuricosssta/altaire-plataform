import { NextRequest, NextResponse } from 'next/server';
import { proxyBrandRequest } from '@/app/api/brands/_proxy';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ brandId: string }> },
) {
  const { brandId } = await params;
  const result = await proxyBrandRequest(request, `/${brandId}`);

  if ('ok' in result) {
    return NextResponse.json(result.data, { status: result.status });
  }
  return NextResponse.json(result, { status: result.status });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ brandId: string }> },
) {
  const { brandId } = await params;
  const body = await request.json().catch(() => null);
  const result = await proxyBrandRequest(request, `/${brandId}`, {
    method: 'PATCH',
    body,
  });

  if ('ok' in result) {
    return NextResponse.json(result.data, { status: result.status });
  }
  return NextResponse.json(result, { status: result.status });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ brandId: string }> },
) {
  const { brandId } = await params;
  const result = await proxyBrandRequest(request, `/${brandId}`, {
    method: 'DELETE',
  });

  if ('ok' in result) {
    return NextResponse.json(result.data, { status: result.status });
  }
  return NextResponse.json(result, { status: result.status });
}
