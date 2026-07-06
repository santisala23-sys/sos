"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { ScanLogWithProfile } from "@/types/database";
import { LogDetailView } from "@/components/dashboard/LogDetailView";

export default function LogDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [log, setLog] = useState<ScanLogWithProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/scan-logs/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setLog(data.log);
      } else {
        router.push("/dashboard");
      }
      setLoading(false);
    }
    load();
  }, [params.id, router]);

  if (loading) {
    return (
      <main className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600" />
          <p className="text-sm font-medium text-neutral-500">Cargando evento...</p>
        </div>
      </main>
    );
  }

  if (!log) return null;

  return <LogDetailView log={log} />;
}
