import { Mail } from "lucide-react";
import { AuthRecoveryShell } from "@/components/auth/AuthRecoveryShell";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export default function RecuperarContrasenaPage() {
  return (
    <AuthRecoveryShell
      icon={Mail}
      eyebrow="Recuperación de acceso"
      title="¿Olvidaste tu contraseña?"
      description="Te enviamos un enlace al mismo email que usás para verificar tu cuenta."
    >
      <ForgotPasswordForm />
    </AuthRecoveryShell>
  );
}
