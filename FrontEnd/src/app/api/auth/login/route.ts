// FrontEnd/src/app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { loginSchema } from "@/lib/validations/auth";
import { createAuthToken } from "@/lib/auth/token.service";
import {
  findOrCreateBackendUser,
  fetchUserEditorialProjects,
} from "@/lib/auth/userProvision";
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

    if (email === "erro@legionaltaire.com.br") {
      return NextResponse.json(
        { success: false, message: "E-mail ou senha incorretos." },
        { status: 401 }
      );
    }

    // Busca ou provisiona o usuário real no MongoDB (BackEnd NestJS)
    const provisioned = await findOrCreateBackendUser({
      email,
      password,
      createIfMissing: true,
    });

    // Gera JWT real HS256 compatível com o AuthGuard do BackEnd e com o BFF
    const token = await createAuthToken({
      sub: provisioned.id,
      email: provisioned.email,
      name: provisioned.fullName,
      org: "altaire",
      role: "owner",
    });

    // Verifica se o usuário já possui projetos editoriais ativos no BackEnd
    const userProjects =
      email === "novo@legionaltaire.com.br"
        ? []
        : await fetchUserEditorialProjects(token, provisioned.id);

    const activeProject = userProjects[0] ?? null;
    const hasActiveProject = Boolean(activeProject);

    const userSession: UserSession = {
      id: provisioned.id,
      email: provisioned.email,
      fullName: provisioned.fullName,
      role: "owner",
      tier: "pro",
      hasActiveProject,
      activeProjectContext: activeProject,
      createdAt: new Date().toISOString(),
    };

    const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24;
    const cookieStore = await cookies();
    for (const cookieName of ["auth_token", "access_token", "la_session_token"]) {
      cookieStore.set({
        name: cookieName,
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge,
        path: "/",
      });
    }

    // Se já tiver projeto ativo -> vai direto para o Workspace do projeto
    // Se for o 1º login sem projeto -> vai para a Central Estratégica abrindo a criação de projeto
    const redirectUrl = activeProject
      ? `/dashboard/editorial/${activeProject.id}`
      : "/dashboard/editorial?newProject=true";

    const responsePayload: AuthResponse = {
      success: true,
      user: userSession,
      redirectUrl,
      token,
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
