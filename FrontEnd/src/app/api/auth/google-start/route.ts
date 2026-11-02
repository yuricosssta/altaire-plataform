import { NextResponse } from "next/server";
import { isGoogleOAuthConfigured, signIn } from "@/auth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const originPage = url.searchParams.get("from") === "cadastro" ? "/cadastro" : "/login";

  if (!isGoogleOAuthConfigured) {
    return NextResponse.redirect(
      new URL(`${originPage}?error=GoogleNotConfigured`, request.url)
    );
  }

  return signIn("google", { redirectTo: "/api/auth/oauth-success" });
}

