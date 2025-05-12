import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import { compare } from "bcrypt";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24,   // 1 día
    updateAge: 60 * 60,     // refrescar cada hora
  },
  providers: [
    CredentialsProvider({
      name: "Credenciales",
      credentials: {
        email: { label: "Correo", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials, req) {
        const email = credentials?.email;
        const password = credentials?.password;
        if (!email || !password) {
          throw new Error("Correo y contraseña son obligatorios");
        }

        const user = await prisma.user.findUnique({
          where: { email },
        });
        if (!user) {
          throw new Error("Usuario no encontrado");
        }

        const isValid = await compare(password, user.password);
        if (!isValid) {
          throw new Error("Contraseña incorrecta");
        }

        // Devuelve sólo los campos que quieres exponer en session.user
        return { id: user.id, name: user.name, email: user.email };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = (user as any).id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.id = token.id as string;
      return session;
    },
  },
};

export default NextAuth(authOptions);
