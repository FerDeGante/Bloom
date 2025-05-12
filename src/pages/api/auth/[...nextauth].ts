// src/pages/api/auth/[...nextauth].ts
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter }  from "@next-auth/prisma-adapter";
import prisma              from "@/lib/prisma";      // revisa que prisma.ts importe correctamente
import { compare }         from "bcrypt";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret:  process.env.NEXTAUTH_SECRET,
  pages:   { signIn: "/login" },
  session: { strategy: "jwt", maxAge: 86400 },
  providers: [
    CredentialsProvider({
      name: "Email / Password",
      credentials: {
        email:    { label: "Correo",    type: "email"    },
        password: { label: "Contraseña",type: "password" },
      },
      async authorize(creds) {
        if (!creds?.email || !creds?.password) return null;
        const user = await prisma.user.findUnique({ where: { email: creds.email } });
        if (user && await compare(creds.password, user.password)) return user;
        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.id = token.id as string;
      return session;
    }
  },
  debug: process.env.NODE_ENV === "development",
};

export default NextAuth(authOptions);
