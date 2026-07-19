import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";

const ACTIVATE_DESTINATION = "/dashboard#activar-producto";

export default async function ActivarIndexPage() {
  const session = await getSession();

  if (session) {
    redirect(ACTIVATE_DESTINATION);
  }

  redirect(`/login?redirect=${encodeURIComponent(ACTIVATE_DESTINATION)}`);
}
