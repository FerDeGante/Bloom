// src/pages/api/auth/[...nextauth].ts
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import { compare } from "bcrypt";

// Configuración de NextAuth
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma), // Conexión con Prisma
  secret: process.env.NEXTAUTH_SECRET, // Llave secreta para JWT
  session: {
    strategy: "jwt", // Usar JWT para las sesiones
    maxAge: 60 * 60 * 24, // 1 día de duración de la sesión
  },
  pages: {
    signIn: "/login", // Página personalizada de inicio de sesión
    error: "/login", // Página de error
  },
  providers: [
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Correo", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null; // Si faltan credenciales, no autorizar
        }

        // Buscar usuario en la base de datos
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        // Verificar contraseña
        if (user && (await compare(credentials.password, user.password))) {
          return user; // Usuario autorizado
        }

        return null; // Credenciales inválidas
      },
    }),
  ],
  callbacks: {
    // Callback para manejar el token JWT
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id; // Agregar ID del usuario al token
        token.email = user.email; // Agregar email al token
        token.name = user.name; // Agregar nombre al token
      }
      return token;
    },
    // Callback para manejar la sesión
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string; // Agregar ID del usuario a la sesión
        session.user.email = token.email as string; // Agregar email a la sesión
        session.user.name = token.name as string; // Agregar nombre a la sesión
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);
