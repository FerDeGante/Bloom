'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import PackagesGrid from '../PackagesGrid';
import Image from 'next/image';

interface UserPackage {
  id: string;
  title: string;
  sessions: number;
  price: number;
  inscription: number;
}

export default function PackagesSection() {
  const { data: session } = useSession({ required: true });
  const [pkgs, setPkgs] = useState<UserPackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/user/packages')
      .then(r => r.json())
      .then(data => {
        setPkgs(data.packages ?? []);
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
        <button
          onClick={() => window.history.pushState({}, '', '/dashboard?tab=mis-paquetes')}
          className="btn btn-orange"
        >
          Comprar paquete
        </button>
      </div>
    );
  }

  const handleBuy = async (packageId: string) => {
    const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ packageId }),
    });
    const { sessionId } = await res.json();
    stripe?.redirectToCheckout({ sessionId });
  };

  return <PackagesGrid paquetes={pkgs} onBuy={handleBuy} />;
}
