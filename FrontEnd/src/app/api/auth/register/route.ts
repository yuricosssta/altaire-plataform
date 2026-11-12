// FrontEnd/src/app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { registerSchema } from "@/lib/validations/auth";
import { createAuthToken } from "@/lib/auth/token.service";
import {
  AuthBackendError,
  fetchUserEditorialProjects,
  registerBackendUser,
} from "@/lib/auth/userProvision";
import type { AuthResponse, UserSession } from "@/types/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: "Dados de cadastro inválidos ou incompletos." },
        { status: 400 }
      );
    }

    const { email, fullName, password } = result.data;

    if (email === "existe@legionaltaire.com.br") {
      return NextResponse.json(
        { success: false, message: "Este e-mail já está em uso." },
        { status: 409 }
      );
    }

    // Realiza auto-cadastro (ou vínculo de organização) na API do Cazuá e sincroniza no MongoDB do Altaire
    const provisioned = await registerBackendUser({
      email,
      fullName,
      password,
    });

    const token = await createAuthToken({
      sub: provisioned.id,
      email: provisioned.email,
      name: provisioned.fullName,
      org: "altaire",
      role: provisioned.role,
    });

    const userProjects = provisioned.isNewUser
      ? []
      : await fetchUserEditorialProjects(token, provisioned.id);
    const activeProject = userProjects[0] ?? null;
    const hasActiveProject = Boolean(activeProject);

    const userSession: UserSession = {
      id: provisioned.id,
      email: provisioned.email,
      fullName: provisioned.fullName,
      role: provisioned.role,
      tier: "free",
      hasActiveProject,
      activeProjectContext: activeProject,
      createdAt: new Date().toISOString(),
    };

    const cookieStore = await cookies();
    for (const cookieName of ["auth_token", "access_token", "la_session_token"]) {
      cookieStore.set({
        name: cookieName,
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24,
        path: "/",
      });
    }

    const redirectUrl = activeProject
      ? `/dashboard/editorial/${activeProject.id}`
      : "/dashboard/editorial?newProject=true";

    const responsePayload: AuthResponse = {
      success: true,
      user: userSession,
      redirectUrl,
      token,
    };

    return NextResponse.json(responsePayload, { status: 201 });
  } catch (error) {
    if (error instanceof AuthBackendError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.statusCode }
      );
    }
    console.error("[REGISTER_ERROR]", error);
    return NextResponse.json(
      { success: false, message: "Falha interna no servidor ao criar conta." },
      { status: 500 }
    );
  }
}
