import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { createAuthToken } from "@/lib/auth/token.service";
import { upsertOAuthBackendUser } from "@/lib/auth/userProvision";

export const isGoogleOAuthConfigured = Boolean(
  process.env.AUTH_GOOGLE_ID?.trim() && process.env.AUTH_GOOGLE_SECRET?.trim()
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret:
    process.env.AUTH_SECRET ||
    process.env.JWT_SECRET ||
    "fallback-dev-secret",
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 30, // 30 dias
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || "unconfigured-google-client-id",
      clientSecret:
        process.env.AUTH_GOOGLE_SECRET || "unconfigured-google-client-secret",
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (account?.provider === "google" && user?.email) {
        const provisioned = await upsertOAuthBackendUser({
          email: user.email,
          fullName: user.name,
          googleId: account.providerAccountId,
          avatarUrl: user.image,
        });

        const internalToken = await createAuthToken({
          sub: provisioned.id,
          email: provisioned.email,
          name: provisioned.fullName,
          org: "altaire",
          role: provisioned.role,
        });

        token.backendUserId = provisioned.id;
        token.email = provisioned.email;
        token.name = provisioned.fullName;
        token.role = provisioned.role;
        token.picture = provisioned.avatarUrl || user.image;
        token.internalToken = internalToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.backendUserId || token.sub || "");
        session.user.email = String(token.email || session.user.email || "");
        session.user.name = String(token.name || session.user.name || "");
      }
      (session as unknown as Record<string, unknown>).internalToken =
        token.internalToken;
      (session as unknown as Record<string, unknown>).backendUserId =
        token.backendUserId;
      return session;
    },
  },
});

