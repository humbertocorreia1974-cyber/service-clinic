import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null;

        // Sem isso, um atacante podia tentar senha ilimitadamente contra
        // qualquer e-mail conhecido (ex. o admin da própria clínica).
        // Limita por e-mail (alvo do ataque) E por IP (origem), o que vier
        // primeiro - evita tanto "uma conta sob ataque" quanto "um IP
        // varrendo várias contas".
        const ip = req?.headers?.["x-forwarded-for"]?.toString().split(",")[0]?.trim() || "unknown";
        const emailKey = `login:email:${credentials.email.toLowerCase()}`;
        const ipKey = `login:ip:${ip}`;
        if (!checkRateLimit(emailKey, 10, 15 * 60 * 1000) || !checkRateLimit(ipKey, 30, 15 * 60 * 1000)) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user) return null;
        const ok = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!ok) return null;
        return { id: user.id, name: user.name ?? undefined, email: user.email , role: (user as any).role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) { if (user) (token as any).role = (user as any).role;
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        if (token.id) {
          const freshUser = await prisma.user.findUnique({ where: { id: token.id as string }, select: { role: true } });
          (session.user as any).role = freshUser ? freshUser.role : (token as any).role;
          session.user.id = token.id as string;
        } else {
          (session.user as any).role = (token as any).role;
        }
      }
      return session;
    },
  },
};
