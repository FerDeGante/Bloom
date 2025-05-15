import Link from "next/link";
import React, { ReactNode } from "react";
import {
  FaWater,
  FaShoePrints,
  FaHandsHelping,
  FaRunning,
  FaSpa,
  FaPaintBrush,
  FaShieldAlt,
  FaDumbbell,
  FaLeaf,
  FaAmbulance,
} from "react-icons/fa";

interface Servicio {
  slug: string;
  icon: ReactNode;
  label: string;
  color: "primary" | "secondary" | "tertiary";
}

const servicios: Servicio[] = [
  { slug: "agua", icon: <FaWater />, label: "Estimulación en agua", color: "primary" },
  { slug: "piso", icon: <FaShoePrints />, label: "Estimulación en piso", color: "secondary" },
  { slug: "quiropractica", icon: <FaHandsHelping />, label: "Quiropráctica", color: "tertiary" },
  { slug: "fisioterapia", icon: <FaRunning />, label: "Fisioterapia", color: "primary" },
  { slug: "masajes", icon: <FaSpa />, label: "Masajes", color: "secondary" },
  { slug: "cosmetologia", icon: <FaPaintBrush />, label: "Cosmetología", color: "tertiary" },
  { slug: "prevencion-lesiones", icon: <FaShieldAlt />, label: "Prevención de lesiones", color: "primary" },
  { slug: "preparacion-fisica", icon: <FaDumbbell />, label: "Preparación física", color: "secondary" },
  { slug: "nutricion", icon: <FaLeaf />, label: "Nutrición", color: "tertiary" },
  { slug: "medicina-rehabilitacion", icon: <FaAmbulance />, label: "Medicina en rehabilitación", color: "primary" },
];

export default function NuestrosServicios() {
  return (
    <section className="services-grid section-gray">
      <div className="container">
        <div className="row g-4">
          {servicios.map((s) => (
            <div key={s.slug} className="col-6 col-sm-4 col-md-3">
              <Link
                href={`/dashboard?tab=reservar&servicio=${s.slug}`}
                className={`service-btn service-${s.color}`}
              >
                <span className="icon">{s.icon}</span>
                <span className="label">{s.label}</span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}