import { GetServerSideProps } from "next";
import Head from "next/head";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]";
import SidebarTherapist from "@/components/Sidebar/SidebarTherapist";
import CalendarSection from "@/components/CalendarSection";
import { useSession } from "next-auth/react";

export default function TherapistHome() {
  const { data: session } = useSession();

  if (!session?.user?.id) return <div className="text-center my-5">Cargando...</div>;

  return (
    <>
      <Head>
        <title>Dashboard Terapeuta • Bloom Fisio</title>
      </Head>
      <div className="d-flex" style={{minHeight: "90vh"}}>
        <SidebarTherapist />
        <div className="flex-grow-1 px-4 py-3">
          <CalendarSection
            apiBaseUrl={`/api/therapist/${session.user.id}/reservations`}
            canEdit={true}
            title="Mis Reservaciones para"
          />
        </div>
      </div>
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
