// src/pages/_app.tsx
import "../styles/globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "chart.js/auto";
import "react-datepicker/dist/react-datepicker.css";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Creamos el QueryClient una sola vez
const queryClient = new QueryClient();

export default function MyApp({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  const { pathname } = useRouter();

  // Rutas que tienen su propio layout (dashboard, admin, success)
  const isDashboardOrAdmin =
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname === "/success" ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/");

  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        {/* Navbar / Footer sólo en rutas públicas */}
        {!isDashboardOrAdmin && <Navbar />}
        <Component {...pageProps} />
        {!isDashboardOrAdmin && <Footer />}
      </QueryClientProvider>
    </SessionProvider>
  );
}
