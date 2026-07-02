import { AuthPageShell } from "@/components/auth/AuthPageShell";

type LoginPageProps = {
  searchParams: Promise<{ error?: string; redirect?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error, redirect } = await searchParams;

  return (
    <AuthPageShell
      mode="login"
      error={error ?? null}
      redirectTo={redirect ?? null}
    />
  );
}
