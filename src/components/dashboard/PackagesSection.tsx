// src/components/dashboard/PackagesSection.jsx
"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import PackageCard from "../PackageCard";
import Image from "next/image";

export default function PackagesSection() {
  const { data: session } = useSession({ required: true });
  const [pkgs, setPkgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/packages")
      .then((r) => r.json())
      .then((data) => {
        setPkgs(data.packages || []); // Asegúrate de que sea un array
        setLoading(false);
      })
      .catch(() => {
        setPkgs([]);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Cargando paquetes…</p>;

  if (pkgs.length === 0) {
    return (
      <div className="text-center">
        <Image
          src="/images/cta-package.png"
          alt="Compra un paquete"
          width={300}
          height={200}
        />
        <p>No tienes paquetes vigentes.</p>
        <a
          href="/comprar-paquete"
          className="btn btn-orange"
        >
          Comprar paquete
        </a>
      </div>
    );
  }

  return (
    <div className="row g-4">
      {pkgs.map((p) => (
        <div className="col-md-4" key={p.id}>
          <PackageCard pkg={p} onBuy={() => handleBuy(p.id)} />
        </div>
      ))}
    </div>
  );

  async function handleBuy(packageId: string) {
    const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ packageId }),
    });
    const { sessionId } = await res.json();
    stripe?.redirectToCheckout({ sessionId });
  }
}
