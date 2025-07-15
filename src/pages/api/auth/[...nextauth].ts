// src/pages/api/auth/[...nextauth].ts
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider           from "next-auth/providers/credentials";
import { PrismaAdapter }             from "@next-auth/prisma-adapter";
import prisma                        from "@/lib/prisma";
import { compare }                   from "bcrypt";

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
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(creds) {
        if (!creds?.email || !creds?.password) return null;
        // Busca el usuario por email
        const user = await prisma.user.findUnique({ where: { email: creds.email } });
        // Comprueba la contraseña
        if (user && await compare(creds.password, user.password)) {
          const { password, ...userWithoutPass } = user; // <-- ¡AQUÍ EL CAMBIO!
          return userWithoutPass;
        }
        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id   = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id   = token.id as string;
        (session.user as any).role = token.role as string;
      }
      return session;
    }
  },
  debug: process.env.NODE_ENV === "development",
};

export default NextAuth(authOptions);
