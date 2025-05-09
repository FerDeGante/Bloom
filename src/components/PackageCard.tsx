// src/components/PackageCard.tsx
import React from "react";

interface Props {
  title: string;
  description: string;
  price: number;
  onBuy: ()=>void;
}

export default function PackageCard({ title, description, price, onBuy }: Props) {
  return (
    <div className="card servicio-card text-center h-100">
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{title}</h5>
        <p className="card-text">{description}</p>
        <p className="h4 mt-auto">${price}</p>
        <button onClick={onBuy} className="btn btn-orange mt-3">
          Comprar
        </button>
      </div>
    </div>
  );
}
