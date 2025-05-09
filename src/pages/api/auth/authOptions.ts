// src/pages/api/auth/authOptions.ts

import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import { compare } from "bcrypt";

export const authOptions: NextAuthOptions = {
  // Usamos el adaptador de Prisma
  adapter: PrismaAdapter(prisma),

  // Tiempo de vida de la sesión y frecuencia de actualización del token
  session: {
    maxAge: 60 * 60 * 24,    // 1 día
    updateAge: 60 * 60,      // refresca el token cada hora
  },

  // Token secreto para firmar cookies/jwt
  secret: process.env.NEXTAUTH_SECRET,

  providers: [
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Correo", type: "email", placeholder: "tú@ejemplo.com" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;
        // Busca al usuario por email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        // Comprueba la contraseña
        if (user && (await compare(credentials.password, user.password))) {
          return user;
        }
        return null;
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // Al hacer login, añadimos el id de usuario al token
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      // Exponemos el id de usuario en session.user.id
      if (session.user) session.user.id = token.id as string;
      return session;
    },
  },
};

// También exponemos por defecto NextAuth configurado:
export default NextAuth(authOptions);
