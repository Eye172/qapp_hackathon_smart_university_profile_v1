// Edge middleware — uses only the edge-safe authConfig (no bcrypt/Prisma).
import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  // Protect every route except static assets and the dev/* playground
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|dev|api/auth|api/register|api/llm|api/fit).*)",
  ],
};
