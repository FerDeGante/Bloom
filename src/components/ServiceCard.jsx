import Link from "next/link";

export default function ServiceCard({ id, nombre, precio }) {
  return (
    <div className="col-md-4 mb-4">
      <div className="card servicio-card h-100">
        <div className="card-body d-flex flex-column">
          <h2 className="card-title h5">{nombre}</h2>
          <p className="card-text flex-grow-1">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris porta facilisis urna.
          </p>
          <p className="fw-bold">Desde ${precio} MXN</p>
          <Link href={`/citas?servicio=${id}`} className="btn btn-primary mt-2">Reservar</Link>
        </div>
      </div>
    </div>
  );
}
