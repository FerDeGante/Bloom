"use client";

import { useState, ReactNode } from "react";
import { useSession } from "next-auth/react";
import ProtectedRoute from "./ProtectedRoute";
import Navbar from "./Navbar";
import Footer from "./Footer";
import AccountSection from "./dashboard/AccountSection";
import PackagesSection from "./dashboard/PackagesSection";
import HistorySection from "./dashboard/HistorySection";
import ReservarSection from "./dashboard/ReservarSection";

type TabKey = "mi-cuenta" | "mis-paquetes" | "historial" | "reservar";

export default function DashboardLayout({ children }: { children?: ReactNode }) {
  const { data: session } = useSession();
  const [tab, setTab] = useState<TabKey>("mi-cuenta");

  const tabs: readonly [TabKey, string][] = [
    ["mi-cuenta", "Mi cuenta"],
    ["mis-paquetes", "Mis paquetes"],
    ["historial", "Historial de reservas"],
    ["reservar", "Reservar"],
  ];

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="dashboard-container py-4">
        <div className="dashboard-header">
          <h2>Hola, {session?.user?.name || "Usuario"}</h2>
        </div>
        <ul className="nav nav-tabs mb-4 justify-content-center">
          {tabs.map(([key, label]) => (
            <li className="nav-item" key={key}>
              <button
                className={`nav-link ${tab === key ? "active" : ""}`}
                onClick={() => setTab(key)}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
        <div>
          {tab === "mi-cuenta" && <AccountSection />}
          {tab === "mis-paquetes" && <PackagesSection />}
          {tab === "historial" && <HistorySection />}
          {tab === "reservar" && <ReservarSection />}
        </div>
        {children}
        <div style={{ marginTop: "2rem" }}>
          <Footer />
        </div>
      </div>
    </ProtectedRoute>
  );
}