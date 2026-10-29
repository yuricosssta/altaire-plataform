// FrontEnd/src/app/api/auth/session/route.ts
import { NextResponse } from "next/server";
import { getAuthTokenFromRequest, verifyInternalToken } from "@/lib/auth/token.service";
import { fetchUserEditorialProjects } from "@/lib/auth/userProvision";
import type { UserSession } from "@/types/auth";

export async function GET(request: Request) {
  try {
    const token = await getAuthTokenFromRequest(request);

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Usuário não autenticado." },
        { status: 401 }
      );
    }

    const payload = await verifyInternalToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, message: "Sessão inválida ou expirada." },
        { status: 401 }
      );
    }

    const projects = await fetchUserEditorialProjects(token, payload.sub);
    const activeProject = projects[0] ?? null;

    const session: UserSession = {
      id: payload.sub,
      email: payload.email,
      fullName: payload.name || payload.email.split("@")[0],
      role: "owner",
      tier: "pro",
      hasActiveProject: Boolean(activeProject),
      activeProjectContext: activeProject,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, user: session, token }, { status: 200 });
  } catch (error) {
    console.error("[SESSION_ERROR]", error);
    return NextResponse.json(
      { success: false, message: "Erro ao validar sessão." },
      { status: 500 }
    );
  }
}
