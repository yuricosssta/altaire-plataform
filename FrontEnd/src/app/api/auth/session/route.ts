// FrontEnd/src/app/api/auth/session/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { UserSession } from "@/types/auth";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("la_session_token");

    if (!token?.value) {
      return NextResponse.json(
        { success: false, message: "Usuário não autenticado." },
        { status: 401 }
      );
    }

    // TODO: Validar token JWT com o BackEnd NestJS
    // Mock de retorno de sessão válida
    const session: UserSession = {
      id: "usr_mock123",
      email: "admin@legionaltaire.com.br",
      fullName: "Roberto Zane",
      role: "owner",
      tier: "pro",
      hasActiveProject: true,
      activeProjectContext: {
        id: "prj_abc789",
        name: "Legion Altaire - Projeto Principal",
        niche: "Plataforma SaaS B2B",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, user: session }, { status: 200 });
  } catch (error) {
    console.error("[SESSION_ERROR]", error);
    return NextResponse.json(
      { success: false, message: "Erro ao validar sessão." },
      { status: 500 }
    );
  }
}