import { NextRequest, NextResponse } from 'next/server';
import { proxyOrgRequest } from '@/app/api/organizations/_proxy';
import { getAuthTokenFromRequest, verifyInternalToken } from '@/lib/auth/token.service';
import { resolveAltaireRoleByEmail } from '@/lib/auth/userProvision';

export async function GET(request: NextRequest) {
  const result = await proxyOrgRequest(request, '/my-orgs');

  if ('ok' in result) {
    return NextResponse.json(result.data);
  }

  // Fallback para a organização padrão "Altaire" caso o BackEnd esteja temporariamente inacessível
  const token = await getAuthTokenFromRequest(request);
  const payload = token ? await verifyInternalToken(token) : null;
  if (payload) {
    const role = (payload.role || resolveAltaireRoleByEmail(payload.email)).toUpperCase();
    return NextResponse.json([
      {
        _id: '000000000000000000616c74',
        userId: payload.sub,
        role,
        organizationId: {
          _id: '000000000000000000616c74',
          name: 'Altaire',
          acronym: 'ALT',
          slug: 'altaire',
          plan: 'PRO',
          status: 'active',
          ownerId: payload.sub,
        },
      },
    ]);
  }

  return NextResponse.json(result, { status: 502 });
}