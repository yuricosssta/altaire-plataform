// FrontEnd/src/app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { loginSchema } from "@/lib/validations/auth";
import { WORKSPACE_ROUTES } from "@/lib/constants/routes";
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

    const { email, rememberMe } = result.data;
    const normalizedEmail = email.trim().toLowerCase();

    // Simulação de credencial inválida
    if (normalizedEmail === "erro@legionaltaire.com.br") {
      return NextResponse.json(
        { success: false, message: "E-mail ou senha incorretos." },
        { status: 401 }
      );
    }

    // Identifica cenário do cliente conforme Documento 00 (Seção 1.1 e 1.11):
    // - novo@... -> Cenário A: Aluno novo sem projetos (vai para Onboarding Editorial Inicial)
    // - painel@... -> Cenário C: Aluno recorrente com preferência no Painel do Dia (/dashboard)
    // - Demais e-mails -> Cenário B: Aluno com projetos ativos (vai para Central Estratégica /dashboard/editorial)
    const isNewUserWithoutProjects =
      normalizedEmail === "novo@legionaltaire.com.br" ||
      normalizedEmail.startsWith("novo@");

    const prefersDailyPanel =
      normalizedEmail === "painel@legionaltaire.com.br";

    const mockUser: UserSession = {
      id: isNewUserWithoutProjects ? "usr_new_01" : "usr_roberto_zane",
      email: normalizedEmail,
      fullName: isNewUserWithoutProjects ? "Novo Estrategista" : "Roberto Zane",
      role: "owner",
      tier: "pro",
      hasActiveProject: !isNewUserWithoutProjects,
      activeProjectContext: !isNewUserWithoutProjects
        ? {
            id: "proj-produto-x",
            name: "Produto X — Lançamento Semente",
            niche: "Finanças / Algorithmic Trading",
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
      maxAge: rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24,
      path: "/",
    });

    // Roteamento Pós-Login Oficial (Zero 404):
    // Cenário A (Sem projeto) -> /dashboard/editorial?onboarding=true
    // Cenário C (Preferência Painel do Dia) -> /dashboard
    // Cenário B (Padrão com projetos) -> /dashboard/editorial (Central Estratégica)
    const redirectUrl = isNewUserWithoutProjects
      ? WORKSPACE_ROUTES.onboardingEditorial
      : prefersDailyPanel
        ? WORKSPACE_ROUTES.painelDoDia
        : WORKSPACE_ROUTES.centralEstrategica;

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