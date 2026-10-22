// FrontEnd/src/app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { registerSchema } from "@/lib/validations/auth";
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

    const { email, fullName } = result.data;

    // TODO: Substituir por chamada real ao BackEnd NestJS via fetch()
    if (email === "existe@legionaltaire.com.br") {
      return NextResponse.json(
        { success: false, message: "Este e-mail já está em uso." },
        { status: 409 }
      );
    }

    // Mock de usuário recém-criado (sempre nasce sem projeto)
    const mockUser: UserSession = {
      id: `usr_new_${Date.now()}`,
      email,
      fullName,
      role: "owner",
      tier: "free", // Nasce free até concluir checkout no SaaS
      hasActiveProject: false,
      activeProjectContext: null,
      createdAt: new Date().toISOString(),
    };

    const cookieStore = await cookies();
    cookieStore.set({
      name: "la_session_token",
      value: "mock_jwt_token_register_999",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 1 dia
      path: "/",
    });

    // Encaminha estritamente para o onboarding da Base Estratégica
    const responsePayload: AuthResponse = {
      success: true,
      user: mockUser,
      redirectUrl: "/editorial/base?onboarding=true",
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