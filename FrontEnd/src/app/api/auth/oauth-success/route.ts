import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createAuthToken } from "@/lib/auth/token.service";
import {
  fetchUserEditorialProjects,
  resolvePostLoginRedirectByRole,
  upsertOAuthBackendUser,
} from "@/lib/auth/userProvision";

function getPublicOrigin(request: Request): string {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") || "https";
  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }
  const host = request.headers.get("host");
  if (host) {
    const proto = host.includes("localhost") || host.startsWith("127.0.0.1") ? "http" : "https";
    return `${proto}://${host}`;
  }
  return new URL(request.url).origin;
}

export async function GET(request: Request) {
  const origin = getPublicOrigin(request);

  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.redirect(
        new URL("/login?error=OAuthSessionMissing", origin)
      );
    }

    const sessionRecord = session as unknown as Record<string, unknown>;
    let userId = String(sessionRecord.backendUserId || "");
    let internalToken = String(sessionRecord.internalToken || "");
    const email = session.user.email;
    const fullName = session.user.name || email.split("@")[0];

    let userRole = "member";
    let allowedProjects: string[] = [];

    if (!userId || !internalToken) {
      const provisioned = await upsertOAuthBackendUser({
        email,
        fullName,
        avatarUrl: session.user.image,
      });
      userId = provisioned.id;
      userRole = provisioned.role;
      allowedProjects = provisioned.allowedProjects || [];
      internalToken = await createAuthToken({
        sub: provisioned.id,
        email: provisioned.email,
        name: provisioned.fullName,
        org: "altaire",
        role: provisioned.role,
        allowedProjects,
        permissions: provisioned.permissions || [],
      });
    }

    const userProjects = await fetchUserEditorialProjects(
      internalToken,
      userId,
      userRole,
      allowedProjects,
    );
    const activeProject = userProjects[0] ?? null;

    const redirectPath = resolvePostLoginRedirectByRole(
      userRole,
      activeProject?.id,
      false,
    );

    const response = NextResponse.redirect(new URL(redirectPath, origin));
    const maxAge = 60 * 60 * 24 * 30; // 30 dias

    for (const cookieName of ["auth_token", "access_token", "la_session_token"]) {
      response.cookies.set({
        name: cookieName,
        value: internalToken,
        httpOnly: true,
        secure: origin.startsWith("https://") || process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge,
        path: "/",
      });
    }

    return response;
  } catch (error) {
    console.error("[OAUTH_SUCCESS_CALLBACK_ERROR]", error);
    return NextResponse.redirect(
      new URL("/login?error=OAuthCallbackError", origin)
    );
  }
}
