import { AuthPageShell } from "@/components/auth/AuthPageShell";

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
