// FrontEnd/src/app/api/auth/session/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import {
  createAuthToken,
  getAuthTokenFromRequest,
  verifyInternalToken,
} from "@/lib/auth/token.service";
import {
  fetchUserEditorialProjects,
  resolveAltaireRoleByEmail,
  upsertOAuthBackendUser,
} from "@/lib/auth/userProvision";
import type { UserSession } from "@/types/auth";

export async function GET(request: Request) {
  try {
    let token = await getAuthTokenFromRequest(request);
    let payload = token ? await verifyInternalToken(token) : null;

    // Fallback transparente para sessão ativa do Auth.js v5 (Google OAuth)
    if (!payload) {
      const oauthSession = await auth();
      if (oauthSession?.user?.email) {
        const sessionRecord = oauthSession as unknown as Record<string, unknown>;
        let userId = String(sessionRecord.backendUserId || "");
        const email = oauthSession.user.email;
        const fullName = oauthSession.user.name || email.split("@")[0];
        const role = resolveAltaireRoleByEmail(email);

        if (!userId) {
          const provisioned = await upsertOAuthBackendUser({
            email,
            fullName,
            avatarUrl: oauthSession.user.image,
          });
          userId = provisioned.id;
        }

        token = await createAuthToken({
          sub: userId,
          email,
          name: fullName,
          org: "altaire",
          role,
        });

        payload = await verifyInternalToken(token);

        const cookieStore = await cookies();
        for (const cookieName of [
          "auth_token",
          "access_token",
          "la_session_token",
        ]) {
          cookieStore.set({
            name: cookieName,
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 30,
            path: "/",
          });
        }
      }
    }

    if (!token || !payload) {
      return NextResponse.json(
        { success: false, message: "Usuário não autenticado." },
        { status: 401 }
      );
    }

    const projects = await fetchUserEditorialProjects(token, payload.sub);
    const activeProject = projects[0] ?? null;
    const resolvedRole = resolveAltaireRoleByEmail(payload.email);

    const session: UserSession = {
      id: payload.sub,
      email: payload.email,
      fullName: payload.name || payload.email.split("@")[0],
      role: resolvedRole,
      tier: "pro",
      hasActiveProject: Boolean(activeProject),
      activeProjectContext: activeProject,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(
      { success: true, user: session, token },
      { status: 200 }
    );
  } catch (error) {
    console.error("[SESSION_ERROR]", error);
    return NextResponse.json(
      { success: false, message: "Erro ao validar sessão." },
      { status: 500 }
    );
  }
}
