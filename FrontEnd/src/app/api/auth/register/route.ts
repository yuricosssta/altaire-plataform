// FrontEnd/src/app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { registerSchema } from "@/lib/validations/auth";
import { createAuthToken } from "@/lib/auth/token.service";
import { findOrCreateBackendUser } from "@/lib/auth/userProvision";
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

    // Cria o usuário real no BackEnd NestJS (MongoDB) sem criar projeto editorial nem organização
    const provisioned = await findOrCreateBackendUser({
      email,
      fullName,
      password,
      createIfMissing: true,
    });

    const token = await createAuthToken({
      sub: provisioned.id,
      email: provisioned.email,
      name: provisioned.fullName,
      org: "altaire",
      role: "owner",
    });

    const userSession: UserSession = {
      id: provisioned.id,
      email: provisioned.email,
      fullName: provisioned.fullName,
      role: "owner",
      tier: "free",
      hasActiveProject: false,
      activeProjectContext: null,
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

    // No 1º acesso após cadastro, encaminha para a criação do primeiro projeto editorial
    const responsePayload: AuthResponse = {
      success: true,
      user: userSession,
      redirectUrl: "/dashboard/editorial?newProject=true",
      token,
    };

    return NextResponse.json(responsePayload, { status: 201 });
  } catch (error) {
    console.error("[REGISTER_ERROR]", error);
    return NextResponse.json(
      { success: false, message: "Falha interna no servidor ao criar conta." },
      { status: 500 }
    );
  }
}
