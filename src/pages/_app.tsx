// src/pages/_app.tsx
import '../styles/globals.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function MyApp({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <SessionProvider session={session}>
      {/* Site-wide navbar */}
      <Navbar />

      {/* Page-specific content */}
      <Component {...pageProps} />

      {/* Site-wide footer */}
      <Footer />
    </SessionProvider>
  );
}
