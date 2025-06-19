import { GetServerSideProps } from "next";
import Head from "next/head";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]";
import TherapistDashboard from "@/components/therapist/TherapistDashboard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TherapistPage() {
  return (
    <>
      <Head>
        <title>Dashboard Terapeuta • Bloom Fisio</title>
      </Head>
      <Navbar />
      <div className="py-4 container">
        <h2 className="mb-4 text-center">Mis Reservaciones</h2>
        <TherapistDashboard />
      </div>
      <Footer />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  if (!session) {
    return { redirect: { destination: "/login", permanent: false } };
  }
  if ((session.user as any).role !== "THERAPIST") {
    return { redirect: { destination: "/", permanent: false } };
  }
  return { props: {} };
};
