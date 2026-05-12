import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const authOptions = {
  session: {
    strategy: "jwt" as const,
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
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
  events: {
    async signIn({ user, account, profile }: any) {
        // We can't import logActivity here easily because of server/client boundary or top-level await issues in some environments
        // But since this is a route, we can try.
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
