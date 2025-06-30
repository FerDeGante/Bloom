import { GetServerSideProps } from "next";
import Head from "next/head";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]";
import SidebarTherapist from "@/components/Sidebar/SidebarTherapist";
import ManualReservationSection from "@/components/admin/ManualReservationSection";
import { useSession } from "next-auth/react";

export default function ManualTherapistPage() {
  const { data: session } = useSession();

  if (!session?.user?.id) return <div className="text-center my-5">Cargando...</div>;

  return (
    <>
      <Head>
        <title>Crear reservación manual • Bloom Fisio</title>
      </Head>
      <div className="d-flex" style={{minHeight: "90vh"}}>
        <SidebarTherapist />
        <div className="flex-grow-1 px-4 py-3">
          <ManualReservationSection
            apiClientsUrl="/api/therapist/clients"
            apiPackagesUrl="/api/therapist/packages"
            apiBranchesUrl="/api/admin/branches"
            apiReservationUrl="/api/admin/reservations"
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