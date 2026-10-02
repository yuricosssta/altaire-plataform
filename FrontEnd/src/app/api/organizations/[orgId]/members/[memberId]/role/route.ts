import { NextRequest, NextResponse } from 'next/server';
import { proxyOrgRequest } from '@/app/api/organizations/_proxy';
import { error, ERROR_CODES } from '@/lib/api/response';
 
export async function PATCH(
  request: NextRequest,
  { params }: { params: { orgId: string; memberId: string } },
) {
  const body = await request.json().catch(() => ({}));

  const result = await proxyOrgRequest(
    request,
    `/${params.orgId}/members/${params.memberId}/role`,
    { method: 'PATCH', body },
  );

  if ('ok' in result) {
    return NextResponse.json(result.data);
  }

  return NextResponse.json(result, { status: 502 });
}