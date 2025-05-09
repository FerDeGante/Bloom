// src/components/PackageCard.tsx
import React from 'react';

export interface Package {
  id: string;
  title: string;
  sessions: number;
  price: number;
  inscription: number;
}

interface PackageCardProps {
  pkg: Package;
  onBuy?: () => void;
}

export default function PackageCard({ pkg, onBuy }: PackageCardProps) {
  return (
    <div className="card servicio-card text-center h-100">
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{pkg.title}</h5>
        <p>{pkg.sessions} sesiones/mes</p>
        <p>Inscripción: ${pkg.inscription}</p>
        <p className="h4 mt-auto">${pkg.price}</p>
        {onBuy && (
          <button onClick={onBuy} className="btn btn-orange mt-3">
            Comprar
          </button>
        )}
      </div>
    </div>
  );
}
