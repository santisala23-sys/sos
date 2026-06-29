import { AuthPageShell } from "@/components/auth/AuthPageShell";

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;

  return <AuthPageShell mode="login" error={error ?? null} />;
}
