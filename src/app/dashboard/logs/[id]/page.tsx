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
      <div className="flex min-h-dvh items-center justify-center text-neutral-500">
        Cargando...
      </div>
    );
  }

  if (!log) return null;

  return <LogDetailView log={log} />;
}
