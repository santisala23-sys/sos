import Link from "next/link";
import { AuthForm } from "@/components/auth/AuthForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-neutral-50 px-4 py-12">
      <div className="mb-8 text-center">
        <Link href="/" className="text-2xl font-black text-blue-800">
          SOS
        </Link>
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
