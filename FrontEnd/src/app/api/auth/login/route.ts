// FrontEnd/src/app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { loginSchema } from "@/lib/validations/auth";
import type { AuthResponse, UserSession } from "@/types/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: "Dados de login inválidos." },
        { status: 400 }
      );
    }

    const { email, password, rememberMe } = result.data;

    // TODO: Substituir por chamada real ao BackEnd NestJS via fetch()
    // Simulação temporária de validação
    if (email === "erro@legionaltaire.com.br") {
      return NextResponse.json(
        { success: false, message: "E-mail ou senha incorretos." },
        { status: 401 }
      );
    }

    // Mock de usuário sem projeto editorial
    const hasProject = email !== "novo@legionaltaire.com.br";

    const mockUser: UserSession = {
      id: "usr_mock123",
      email,
      fullName: "Usuário Mockado",
      role: "owner",
      tier: "pro",
      hasActiveProject: hasProject,
      activeProjectContext: hasProject
        ? {
            id: "prj_abc789",
            name: "Projeto Principal Altaire",
            niche: "Tecnologia B2B",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        : null,
      createdAt: new Date().toISOString(),
    };

    // Grava o cookie de sessão HTTP-Only seguro
    const cookieStore = await cookies();
    cookieStore.set({
      name: "la_session_token",
      value: "mock_jwt_token_12345",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24, // 30 dias ou 1 dia
      path: "/",
    });

    // Lógica Canônica de Roteamento Pós-Login
    // Sem projeto -> Vai para Base Estratégica (Onboarding)
    // Com projeto -> Vai para o Dashboard ou Base Estratégica já carregada
    const redirectUrl = mockUser.hasActiveProject
      ? "/editorial/base"
      : "/editorial/base?onboarding=true";

    const responsePayload: AuthResponse = {
      success: true,
      user: mockUser,
      redirectUrl,
    };

    return NextResponse.json(responsePayload, { status: 200 });
  } catch (error) {
    console.error("[LOGIN_ERROR]", error);
    return NextResponse.json(
      { success: false, message: "Falha interna no servidor de autenticação." },
      { status: 500 }
    );
  }
}