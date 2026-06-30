import { AuthPageShell } from "@/components/auth/AuthPageShell";

type RegisterPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const { error } = await searchParams;

  return <AuthPageShell mode="register" error={error ?? null} />;
}
