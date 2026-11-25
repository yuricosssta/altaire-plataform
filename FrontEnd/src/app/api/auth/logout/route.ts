import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true }, { status: 200 });
  const cookieNames = [
    "auth_token",
    "access_token",
    "la_session_token",
    "active_company_id",
  ];

  for (const name of cookieNames) {
    response.cookies.set({
      name,
      value: "",
      httpOnly: name !== "active_company_id",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });
  }

  return response;
}
