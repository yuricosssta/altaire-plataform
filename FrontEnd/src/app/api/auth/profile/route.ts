import { NextRequest, NextResponse } from 'next/server';
import { verifyInternalToken, getAuthTokenFromRequest } from '@/lib/auth/token.service';
import { getBackendApiUrl } from '@/lib/api/serverUtils';
import { success, error, ERROR_CODES } from '@/lib/api/response';

export async function GET(request: NextRequest) {
  const token = await getAuthTokenFromRequest(request);
  if (!token) {
    return NextResponse.json(
      error(ERROR_CODES.UNAUTHORIZED, 'Token de acesso não encontrado.'),
      { status: 401 },
    );
  }

  const payload = await verifyInternalToken(token);
  if (!payload) {
    return NextResponse.json(
      error(ERROR_CODES.UNAUTHORIZED, 'Token inválido ou expirado.'),
      { status: 401 },
    );
  }

  const backendUrl = getBackendApiUrl();
  const meResponse = await fetch(`${backendUrl}/users/${payload.sub}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'x-org-id': 'altaire',
      'x-org-role': 'member',
    },
  });

  if (!meResponse.ok) {
    return NextResponse.json(
      success({
        sub: payload.sub,
        email: payload.email,
        name: payload.name,
        org: 'altaire',
        role: 'member',
      }),
    );
  }

  const userData = await meResponse.json();
  return NextResponse.json(success(userData));
}