import { NextRequest, NextResponse } from 'next/server';
import { proxyAuthLogin } from '@/lib/auth/authProxy';
import { success, error, ERROR_CODES } from '@/lib/api/response';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.email || !body?.password) {
    return NextResponse.json(
      error(ERROR_CODES.VALIDATION_ERROR, 'E-mail e senha são obrigatórios.'),
      { status: 400 },
    );
  }

  try {
    const result = await proxyAuthLogin({
      email: body.email,
      password: body.password,
    });

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
    const message = err instanceof Error ? err.message : 'Erro ao autenticar';
    return NextResponse.json(
      error(ERROR_CODES.UNAUTHORIZED, message),
      { status: 401 },
    );
  }
}