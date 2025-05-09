import type { NextPage } from 'next';
import Head from 'next/head';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

import Navbar from '../components/Navbar';
import NuestrosServicios from '../components/NuestrosServicios';
import PoolSection from '../components/PoolSection';
import ContactForm from '../components/ContactForm';
import Footer from '../components/Footer';

const Home: NextPage = () => {
  const { data: session } = useSession();
  const router = useRouter();

  const handleHero = (e: React.MouseEvent) => {
    e.preventDefault();
    if (session) router.push('/dashboard?tab=reservar');
    else router.push('/login');
  };

  return (
    <>
      <Head>
        <title>Bloom Fisio | Reserva tu cita</title>
        <meta
          name="description"
          content="Reserva tu sesión de fisioterapia de forma fácil y segura en Bloom Fisio."
        />
        <link rel="icon" href="/images/logo_bloom_clean.png" />
      </Head>

      <Navbar />

      {/* Hero */}
      <header className="hero">
       
      </header>

      {/* Sub-hero con copy */}
      <section id="subhero" className="subhero text-center py-5">
        <h2 className="fw-bold">Aumenta la calidad de vida en tu familia</h2>
        <p className="lead">
          Reserva tu sesión de fisioterapia de forma fácil y segura.
        <div className="mt-4">
          <a href="#subhero" className="btn-hero" onClick={handleHero}>
            <span>Agendar tu cita</span>
            <span className="underline" />
          </a>
        </div>
        </p>
      </section>

      <NuestrosServicios />

      <PoolSection />

      <section className="container py-5 text-center">
        <h2 className="mb-4">Recibe tips de bienestar y ofertas exclusivas</h2>
        <div className="mx-auto" style={{ maxWidth: 480 }}>
          <ContactForm />
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Home;
