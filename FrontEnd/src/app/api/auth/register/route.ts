// FrontEnd/src/app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { registerSchema } from "@/lib/validations/auth";
import { createAuthToken } from "@/lib/auth/token.service";
import {
  AuthBackendError,
  registerBackendUser,
} from "@/lib/auth/userProvision";
import type { AuthResponse, UserSession } from "@/types/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Dados de cadastro inválidos. Verifique os campos preenchidos.",
        },
        { status: 400 }
      );
    }

    const { email, fullName, password } = result.data;
    const normalizedEmail = email.trim().toLowerCase();

    if (
      normalizedEmail === "existe@legionaltaire.com.br" ||
      normalizedEmail === "existente@legionaltaire.com.br"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Este endereço de e-mail já possui uma conta ativa.",
        },
        { status: 409 }
      );
    }

    // Cria o usuário real no BackEnd NestJS (MongoDB) com senha criptografada via bcrypt
    const provisioned = await registerBackendUser({
      email: normalizedEmail,
      fullName: fullName.trim(),
      password,
    });

    const token = await createAuthToken({
      sub: provisioned.id,
      email: provisioned.email,
      name: provisioned.fullName,
      org: "altaire",
      role: provisioned.role,
    });

    const userSession: UserSession = {
      id: provisioned.id,
      email: provisioned.email,
      fullName: provisioned.fullName,
      role: provisioned.role,
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
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
    }

    // No 1º acesso após cadastro, encaminha para a criação do primeiro projeto editorial
    const responsePayload: AuthResponse = {
      success: true,
      user: userSession,
      redirectUrl: "/dashboard/editorial?newProject=true&onboarding=true",
      token,
    };

    return NextResponse.json(responsePayload, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof AuthBackendError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.statusCode }
      );
    }
    console.error("[REGISTER_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Falha ao processar criação de conta.",
      },
      { status: 500 }
    );
  }
}