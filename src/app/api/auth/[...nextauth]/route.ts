import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextResponse } from "next/server";

export const authOptions = {
  session: {
    strategy: "jwt" as const,
  },
  providers: [
    // 1. Google Provider (Conditional)
    ...(process.env.GOOGLE_CLIENT_ID ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      })
    ] : []),
    
    // 2. GitHub Provider (Conditional)
    ...(process.env.GITHUB_ID ? [
      GithubProvider({
        clientId: process.env.GITHUB_ID,
        clientSecret: process.env.GITHUB_SECRET || "",
      })
    ] : []),

    // 3. Credentials Provider (Fallback / Demo)
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // For now, allow any login for demo purposes
        if (credentials?.email) {
          return {
            id: credentials.email,
            name: credentials.email.split('@')[0],
            email: credentials.email,
          };
        }
        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "aura_fallback_secret_123",
  events: {
    async signIn({ user }: any) {
        try {
            const { logActivity } = await import("@/lib/logger");
            await logActivity('SIGNIN', user.email || 'Unknown', `قام بتسجيل الدخول إلى النظام`);
        } catch (e) {
            console.error("Failed to log signin", e);
        }
    },
    async createUser({ user }: any) {
        try {
            const { logActivity } = await import("@/lib/logger");
            await logActivity('SIGNUP', user.email || 'Unknown', `قام بإنشاء حساب جديد`);
        } catch (e) {
            console.error("Failed to log signup", e);
        }
    }
  },
  pages: {
    signIn: '/login',
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
