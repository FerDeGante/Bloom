import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]";
import AdminLayout from "@/components/admin/AdminLayout";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  if (!session) {
    return {
      redirect: { destination: "/login", permanent: false },
    };
  }
  if (session.user.role !== "ADMIN") {
    return {
      redirect: { destination: "/dashboard", permanent: false },
    };
  }
  return { props: {} };
};

export default function AdminPage() {
  return <AdminLayout />;
}
