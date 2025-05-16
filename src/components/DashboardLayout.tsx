// File: src/components/DashboardLayout.tsx
"use client";

import { ReactNode, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import ProtectedRoute from "./ProtectedRoute";
import Navbar from "./Navbar";
import Footer from "./Footer";

import AccountSection from "./dashboard/AccountSection";
import PackagesSection from "./dashboard/PackagesSection";
import HistorySection from "./dashboard/HistorySection";
import ReservarPaquete from "./dashboard/ReservarPaquete";

type TabKey = "mi-cuenta" | "mis-paquetes" | "historial" | "reservar";

export default function DashboardLayout({ children }: { children?: ReactNode }) {
  const { data: session } = useSession();
  const router = useRouter();
  const { view, type, sessions, priceId } = router.query;

  const reservarQuery =
    view === "reservar-paquete" &&
    typeof type === "string" &&
    typeof sessions === "string" &&
    typeof priceId === "string";

  const [tab, setTab] = useState<TabKey>(
    reservarQuery ? "reservar" : "mis-paquetes"
  );

  useEffect(() => {
    if (reservarQuery) {
      setTab("reservar");
    }
  }, [reservarQuery]);

  const tabs: [TabKey, string][] = [
    ["mi-cuenta", "Mi cuenta"],
    ["mis-paquetes", "Mis paquetes"],
    ["historial", "Historial"],
    ["reservar", "Reservar"],
  ];

  const handleTab = (key: TabKey) => {
    setTab(key);
    if (key !== "reservar") {
      router.replace("/dashboard", undefined, { shallow: true });
    }
  };

  return (
    <ProtectedRoute>
      <Navbar />

      <div className="dashboard-container py-4">
        <div className="dashboard-header text-center mb-4">
          <h2>Hola, {session?.user?.name || "Usuario"}</h2>
        </div>

        <ul className="nav nav-tabs justify-content-center mb-4">
          {tabs.map(([key, label]) => (
            <li className="nav-item" key={key}>
              <button
                type="button"
                className={`nav-link ${tab === key ? "active" : ""}`}
                onClick={() => handleTab(key)}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>

        {tab === "mi-cuenta" && <AccountSection />}

        {tab === "mis-paquetes" && <PackagesSection />}

        {tab === "historial" && <HistorySection />}

        {tab === "reservar" &&
          (reservarQuery ? (
            <ReservarPaquete
              type={type}
              sessions={Number(sessions)}
              priceId={priceId}
            />
          ) : (
            <PackagesSection />
          ))}

      </div>

      <Footer />
    </ProtectedRoute>
  );
}