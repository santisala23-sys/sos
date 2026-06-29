import { AuthForm } from "@/components/auth/AuthForm";
import { BrandLogo } from "@/components/shared/BrandLogo";

export default function RegisterPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[#faf9fc] px-4 py-12">
      <div className="mb-8 text-center">
        <BrandLogo size="lg" />
        <h1 className="mt-4 text-2xl font-bold text-neutral-900">
          Crear cuenta
        </h1>
        <p className="mt-2 text-neutral-600">
          Registrate como tutor o familiar responsable
        </p>
      </div>
      <AuthForm mode="register" />
    </div>
  );
}
