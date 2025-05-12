// src/pages/dashboard/index.tsx
import Head from "next/head"
import DashboardLayout from "@/components/DashboardLayout"

export default function DashboardPage() {
  return (
    <>
      <Head>
        <title>Dashboard • Bloom Fisio</title>
      </Head>
      {/* NO vuelvas a poner Navbar / Footer aquí */}
      <DashboardLayout />
    </>
  )
}
