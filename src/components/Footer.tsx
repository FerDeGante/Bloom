import Link from "next/link";
import Image from "next/image";
import { FaInstagram, FaMapMarkerAlt, FaPhoneAlt, FaFileContract } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="footer py-5">
      <div className="container d-flex flex-column flex-md-row justify-content-between align-items-center gap-4">
        {/* Izquierda */}
        <div className="d-flex align-items-center gap-3">
          <Image
            src="/images/logo_bloom_clean.png"
            alt="Bloom"
            width={105}
            height={105}
            className="footer-logo"
          />
          <span>© 2025 Bloom Fisio – Todos los derechos reservados.</span>
          <p>
          Creado por{" "}
          <a href="https://de-gante.com/" target="_blank" rel="noopener noreferrer" className="footer-link">
            De Gante®
          </a>.
        </p>
        </div>

        {/* Centro: ubicación + teléfono + Instagram */}
        <div className="text-center">
          <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
            <FaMapMarkerAlt />  
            <Link
              href="https://maps.app.goo.gl/vfEZmEJJ3XpMsPHW7"
              target="_blank"
              className="footer-link"
            >
              Plaza San Juan piso 1 local B, Cuernavaca, Morelos
            </Link>
          </div>
          <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
            <FaPhoneAlt /> 
            <a href="tel:+527772154841" className="footer-link">
              📲 777 215 4841
            </a>
          </div>
          <div className="d-flex align-items-center justify-content-center gap-2">
            <span>Síguenos:</span>
            <Link
              href="https://www.instagram.com/bloom.fisiomx"
              target="_blank"
              className="footer-icon"
            >
              <FaInstagram size={24} />
            </Link>
          </div>
        </div>

        {/* Derecha: términos */}
        <Link href="/terminos" className="d-flex align-items-center footer-link">
          <FaFileContract className="me-1" /> Términos y condiciones
        </Link>
      </div>
    </footer>
  );
}
