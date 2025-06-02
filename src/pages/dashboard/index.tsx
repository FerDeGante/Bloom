// File: src/components/DashboardLayout.tsx
import Head from "next/head";
import DashboardLayout from "@/components/DashboardLayout";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]";

export default function DashboardPage() {
  return (
    <>
      <Head>
        <title>Dashboard • Bloom Fisio</title>
      </Head>
      <DashboardLayout />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  if (!session) {
    return { redirect: { destination: "/login", permanent: false } };
  }
  if (session.user.role === "ADMIN") {
    return { redirect: { destination: "/admin", permanent: false } };
  }
  return { props: {} };
};
