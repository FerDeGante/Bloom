// src/app/servicios/[id]/page.jsx
import { notFound } from "next/navigation";
import Link from "next/link";

const serviciosData = {
  agua: { title: "Estimulación en agua", desc: "…", price: 500 },
  piso: { title: "Estimulación en piso", desc: "…", price: 500 },
  quiropráctica: { title: "Quiropráctica", desc: "…", price: 500 },
  // …añade los demás IDs exactamente como en tu menú
};

export default function ServicePage({ params }) {
  const servicio = serviciosData[params.id];
  if (!servicio) return notFound();

  return (
    <div className="container py-5">
      <h1>{servicio.title}</h1>
      <p>{servicio.desc}</p>
      <div className="card p-4">
        <h2>Costo: ${servicio.price}.00</h2>
        <Link href={`/citas?servicio=${params.id}`} className="btn btn-primary">
          Agendar ahora
        </Link>
      </div>
    </div>
  );
}
