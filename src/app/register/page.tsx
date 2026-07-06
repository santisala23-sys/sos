import type { Metadata } from "next";
import { AuthPageShell } from "@/components/auth/AuthPageShell";

export const metadata: Metadata = {
  title: "Crear cuenta",
  description: "Registrate gratis en SOSme con Google o email. Incluye 1 perfil QR.",
};

export const dynamic = "force-dynamic";

type RegisterPageProps = {
  searchParams: Promise<{ error?: string; redirect?: string }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const { error, redirect } = await searchParams;

  return (
    <AuthPageShell
      mode="register"
      error={error ?? null}
      redirectTo={redirect ?? null}
    />
  );
}
