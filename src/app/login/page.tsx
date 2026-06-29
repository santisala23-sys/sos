import { AuthForm } from "@/components/auth/AuthForm";
import { BrandLogo } from "@/components/shared/BrandLogo";

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[#faf9fc] px-4 py-12">
      <div className="mb-8 text-center">
        <BrandLogo size="lg" />
        <h1 className="mt-4 text-2xl font-bold text-neutral-900">
          Iniciar sesión
        </h1>
        <p className="mt-2 text-neutral-600">
          Accedé al panel para gestionar perfiles QR
        </p>
      </div>
      <AuthForm mode="login" />
    </div>
  );
}
