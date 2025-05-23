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

  // Tratamos /dashboard/* y /success como “rutas de Dashboard”:
  const isDashboard =
    pathname === '/dashboard' ||
    pathname.startsWith('/dashboard/') ||
    pathname === '/success'

  return (
    <SessionProvider session={session}>
      {isDashboard ? (
        // El componente se encarga de su propio Navbar/Footer
        <Component {...pageProps} />
      ) : (
        // Resto de rutas usan Navbar/Footer global
        <>
          <Navbar />
          <Component {...pageProps} />
          <Footer />
        </>
      )}
    </SessionProvider>
  )
}
