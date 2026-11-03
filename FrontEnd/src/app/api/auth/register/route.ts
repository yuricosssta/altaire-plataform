// FrontEnd/src/app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { registerSchema } from "@/lib/validations/auth";
import { WORKSPACE_ROUTES } from "@/lib/constants/routes";
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

    const { fullName, email } = result.data;
    const normalizedEmail = email.trim().toLowerCase();

    if (normalizedEmail === "existente@legionaltaire.com.br") {
      return NextResponse.json(
        {
          success: false,
          message: "Este endereço de e-mail já possui uma conta ativa.",
        },
        { status: 409 }
      );
    }

    const newUser: UserSession = {
      id: `usr_${Date.now()}`,
      email: normalizedEmail,
      fullName: fullName.trim(),
      role: "owner",
      tier: "individual",
      hasActiveProject: false,
      activeProjectContext: null,
      createdAt: new Date().toISOString(),
    };

    const cookieStore = await cookies();
    cookieStore.set({
      name: "la_session_token",
      value: `la_session_${Date.now()}`,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    const responsePayload: AuthResponse = {
      success: true,
      user: newUser,
      redirectUrl: WORKSPACE_ROUTES.onboardingEditorial,
    };

    return NextResponse.json(responsePayload, { status: 201 });
  } catch (error) {
    console.error("[REGISTER_ERROR]", error);
    return NextResponse.json(
      { success: false, message: "Falha ao processar criação de conta." },
      { status: 500 }
    );
  }
}