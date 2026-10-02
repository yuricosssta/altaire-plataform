import { NextRequest, NextResponse } from 'next/server';
import { proxyAuthRefresh, getAuthTokenFromRequest } from '@/lib/auth/authProxy';
import { getAuthTokenFromRequest as getToken } from '@/lib/auth/token.service';
import { success, error, ERROR_CODES } from '@/lib/api/response';

export async function POST(request: NextRequest) {
  const token = await getToken(request);
  if (!token) {
    return NextResponse.json(
      error(ERROR_CODES.UNAUTHORIZED, 'Token de acesso não encontrado.'),
      { status: 401 },
    );
  }

  try {
    const result = await proxyAuthRefresh(token);

    const response = NextResponse.json(success({
      access_token: result.token,
      user: result.user,
    }));

    response.cookies.set('auth_token', result.token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao renovar token';
    return NextResponse.json(
      error(ERROR_CODES.UNAUTHORIZED, message),
      { status: 401 },
    );
  }
}