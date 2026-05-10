import { redirect } from "next/navigation";
import { getCurrentUser } from "@/services/SessionService";

export const dynamic = "force-dynamic";

export default async function RootPage() {
  const session = await getCurrentUser();
  if (session.success) redirect("/dashboard");
  redirect("/auth/login");
}