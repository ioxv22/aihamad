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
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (credentials?.email) {
          return {
            id: credentials.email,
            name: credentials.email.split('@')[0],
            email: credentials.email,
          };
        }
        return null;
      }
    }),
    ...(process.env.GOOGLE_CLIENT_ID ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      })
    ] : []),
    ...(process.env.GITHUB_ID ? [
      GithubProvider({
        clientId: process.env.GITHUB_ID,
        clientSecret: process.env.GITHUB_SECRET || "",
      })
    ] : []),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) session.user.id = token.id;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "aura_fallback_secret_123456",
  debug: true, // Enable debug logs in Vercel to see what's happening
  pages: {
    signIn: '/login',
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
