import { NextRequest, NextResponse } from 'next/server';
import { proxyOrgRequest } from '@/app/api/organizations/_proxy';
import { error, ERROR_CODES } from '@/lib/api/response';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> },
) {
  const { orgId } = await params;
  const result = await proxyOrgRequest(request, `/${orgId}/members`);

  if ('ok' in result) {
    return NextResponse.json(result.data);
  }

  return NextResponse.json(result, { status: 502 });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> },
) {
  const { orgId } = await params;
  const body = await request.json().catch(() => ({}));

  const result = await proxyOrgRequest(request, `/${orgId}/members`, {
    method: 'POST',
    body,
  });

  if ('ok' in result) {
    return NextResponse.json(result.data, { status: 201 });
  }

  return NextResponse.json(result, { status: 502 });
}