// src/pages/_app.tsx
import '../styles/globals.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import type { AppProps } from 'next/app'
import { usePathname } from 'next/navigation'
import { SessionProvider } from 'next-auth/react'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function MyApp({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  const pathname = usePathname() || ''

  // Si la ruta está bajo "/dashboard", NO envolvemos en el Navbar/Footer global
  const isDashboard =
    pathname === '/dashboard' || pathname.startsWith('/dashboard/')

  return (
    <SessionProvider session={session}>
      {isDashboard ? (
        // El propio Component (DashboardPage) se encargará de su Navbar/Footer
        <Component {...pageProps} />
      ) : (
        // Resto de rutas usan el Navbar/Footer global
        <>
          <Navbar />
          <Component {...pageProps} />
          <Footer />
        </>
      )}
    </SessionProvider>
  )
}
