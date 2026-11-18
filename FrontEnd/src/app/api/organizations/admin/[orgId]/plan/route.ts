import { NextRequest, NextResponse } from 'next/server';
import { proxyOrgRequest } from '@/app/api/organizations/_proxy';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> },
) {
  const { orgId } = await params;
  const body = await request.json().catch(() => null);
  const result = await proxyOrgRequest(request, `/admin/${orgId}/plan`, {
    method: 'PATCH',
    body,
  });

  if ('ok' in result) {
    return NextResponse.json(result.data);
  }
  return NextResponse.json(result, { status: (result as any)?.status || 502 });
}
