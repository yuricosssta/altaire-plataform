import { NextResponse } from "next/server";
import { isGoogleOAuthConfigured } from "@/auth";

export async function GET() {
  return NextResponse.json(
    { configured: isGoogleOAuthConfigured },
    { status: 200 }
  );
}
