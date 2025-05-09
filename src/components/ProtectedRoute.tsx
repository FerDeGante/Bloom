"use client";

import React, { ReactNode, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { status } = useSession();
  const router = useRouter();

  // Si no está autorizado, redirige a login
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  // Mientras carga o hace redirect, no renderices nada
  if (status === "loading" || status === "unauthenticated") {
    return null;
  }

  // Ya autenticado, renderiza hijos
  return <>{children}</>;
}
