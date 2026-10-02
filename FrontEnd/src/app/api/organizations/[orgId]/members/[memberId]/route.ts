import { NextRequest, NextResponse } from 'next/server';
import { proxyOrgRequest } from '@/app/api/organizations/_proxy';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { orgId: string; memberId: string } },
) {
  const result = await proxyOrgRequest(
    request,
    `/${params.orgId}/members/${params.memberId}`,
    { method: 'DELETE' },
  );

  if ('ok' in result) {
    return NextResponse.json(result.data);
  }

  return NextResponse.json(result, { status: 502 });
}