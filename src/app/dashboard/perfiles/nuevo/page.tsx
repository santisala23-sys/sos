"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NewProfilePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard?escanear=1#activar-producto");
  }, [router]);

  return (
    <main className="flex min-h-[50vh] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600" />
    </main>
  );
}
