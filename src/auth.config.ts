// Edge-safe auth config (no bcrypt, no Node.js-only modules).
// Used by middleware for JWT validation at the edge.
// Full config with credentials provider lives in src/auth.ts.

import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = nextUrl;

      // Public paths that never need auth
      const isPublic =
        pathname.startsWith("/login") ||
        pathname.startsWith("/register") ||
        pathname.startsWith("/api/auth") ||
        pathname.startsWith("/api/register") ||
        pathname.startsWith("/api/llm") ||
        pathname.startsWith("/api/fit") ||
        pathname.startsWith("/_next") ||
        pathname.startsWith("/favicon");

      if (isPublic) return true;
      if (isLoggedIn) return true;

      // Not logged in, not public → redirect to login
      return Response.redirect(new URL("/login", nextUrl));
    },

    jwt({ token, user }) {
      if (user?.id) token.id = user.id;
      return token;
    },

    session({ session, token }) {
      if (token.id && session.user) {
        (session.user as typeof session.user & { id: string }).id =
          token.id as string;
      }
      return session;
    },
  },
  providers: [], // populated in auth.ts
};
