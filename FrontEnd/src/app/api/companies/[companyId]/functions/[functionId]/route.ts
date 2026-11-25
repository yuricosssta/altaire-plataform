import { NextRequest, NextResponse } from 'next/server';
import { proxyCompanyRequest } from '@/app/api/companies/_proxy';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; functionId: string }> },
) {
  const { companyId, functionId } = await params;
  const body = await request.json().catch(() => null);
  const result = await proxyCompanyRequest(
    request,
    `/${companyId}/functions/${functionId}`,
    {
      method: 'PATCH',
      body,
    },
  );

  if ('ok' in result) {
    return NextResponse.json(result.data, { status: result.status });
  }
  return NextResponse.json(result, { status: result.status });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string; functionId: string }> },
) {
  const { companyId, functionId } = await params;
  const result = await proxyCompanyRequest(
    request,
    `/${companyId}/functions/${functionId}`,
    {
      method: 'DELETE',
    },
  );

  if ('ok' in result) {
    return NextResponse.json(result.data, { status: result.status });
  }
  return NextResponse.json(result, { status: result.status });
}
