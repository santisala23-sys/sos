import { KeyRound } from "lucide-react";
import { AuthRecoveryShell } from "@/components/auth/AuthRecoveryShell";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

type ResetPasswordPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function RestablecerContrasenaPage({
  searchParams,
}: ResetPasswordPageProps) {
  const { token } = await searchParams;

  return (
    <AuthRecoveryShell
      icon={KeyRound}
      eyebrow="Contraseña nueva"
      title="Restablecé tu acceso"
      description="Elegí una contraseña segura. Después podés iniciar sesión con tu email."
    >
      <ResetPasswordForm token={token?.trim() ?? ""} />
    </AuthRecoveryShell>
  );
}
