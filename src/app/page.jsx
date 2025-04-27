import { FaCalendarPlus } from "react-icons/fa";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ServiceCard from "@/components/ServiceCard";
import ContactForm from "@/components/ContactForm";
import NuestrosServicios from "@/components/NuestrosServicios";
import PoolSection from "@/components/PoolSection";



export const metadata = { title: "Bloom Fisio | Agenda tu cita" };

export default function Home() {
  const servicios = [
    { id: "rehab-hombro", nombre: "Rehabilitación de hombro", precio: 650 },
    { id: "terapia-laser", nombre: "Terapia Láser", precio: 500 },
    { id: "masaje-deep", nombre: "Masaje Deep Tissue", precio: 800 },
    { id: "electro", nombre: "Electroestimulación", precio: 550 },
    { id: "kinesio", nombre: "Vendaje Kinesio", precio: 400 },
  ];

  return (
    <>
      <Navbar />

      {/* HERO */}
      <header className="hero">
        <h1 className="display-5 fw-bold text-white">
          Aumenta la calidad de vida en tu familia
        </h1>
        <p className="lead text-white">
          Reserva tu sesión de fisioterapia de forma fácil y segura.
        </p>
        <a href="/citas" className="btn-hero">
          <FaCalendarPlus className="me-2" /> Agenda tu cita
          <span className="underline" />
        </a>
      </header>

      <NuestrosServicios />
      <PoolSection />



      {/* NUESTROS SERVICIOS */}
      <section className="services-grid py-5">
        <div className="container">
          <h2 className="text-center mb-4">Nuestros servicios</h2>
          <div className="row g-4 justify-content-center">
            {[
              { id: "estimulacion", txt: "Estimulación y desarrollo", color: "--secondary", icon: "🌱" },
              { id: "quiro", icon: "💆", txt: "Terapia quiropráctica", color: "#ffb347" },
              { id: "fisio", icon: "🩺", txt: "Fisioterapia", color: "--primary" },
              { id: "masajes", icon: "💤", txt: "Masajes", color: "#9dd5b0" },
              { id: "cosme", icon: "💄", txt: "Cosmetología", color: "--tertiary" },
            ].map((s) => (
              <ServiceCard key={s.id} {...s} />
            ))}
          </div>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section className="container py-5">
        <h2 className="text-center mb-4">¿Por qué elegir Bloom?</h2>
        <div className="row text-center">
          <div className="col-md-4 mb-3">
            <h3 className="h5">
              👩‍⚕️ Especialistas Certificados
            </h3>
            <p>Equipo con experiencia clínica y deportiva.</p>
          </div>
          <div className="col-md-4 mb-3">
            <h3 className="h5">🏊 Alberca Terapéutica</h3>
            <p>Terapias acuáticas que aceleran tu recuperación.</p>
          </div>
          <div className="col-md-4 mb-3">
            <h3 className="h5">💳 Reservas + Pagos Online</h3>
            <p>Agenda y paga de forma 100 % segura.</p>
          </div>
        </div>
      </section>

      {/* TESTIMONIOS */}
      <section className="section-gray">
        <div className="container">
          <h2 className="text-center mb-4">Opiniones de nuestros pacientes</h2>
          <div id="testimonios" className="carousel slide" data-bs-ride="carousel">
            <div className="carousel-inner">
              <div className="carousel-item active text-center p-4">
                <p className="lead">
                  “¡Recuperé movilidad en mi hombro mucho antes de lo previsto!”
                </p>
                <strong>- Mariana R.</strong>
              </div>
              <div className="carousel-item text-center p-4">
                <p className="lead">
                  “La alberca terapéutica hizo la diferencia en mi rehabilitación.”
                </p>
                <strong>- Carlos M.</strong>
              </div>
              <div className="carousel-item text-center p-4">
                <p className="lead">
                  “Excelente atención y profesionales de verdad.”
                </p>
                <strong>- Laura G.</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FORMULARIO LEAD MAGNET */}
      <section className="container py-5">
        <h2 className="text-center mb-4">Recibe tips de bienestar y ofertas exclusivas</h2>
        <ContactForm />
      </section>

      <Footer />
    </>
  );
}
