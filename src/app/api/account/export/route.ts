import { NextResponse } from "next/server";
import JSZip from "jszip";
import { withApi } from "@/lib/api/with-api";
import { getSession } from "@/lib/auth/session";
import { getAccountExport } from "@/lib/db/queries-account-export";
import { markAccountExported } from "@/lib/db/queries-account-self-service";

export const GET = withApi({ rateLimit: "auth" }, async () => {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const payload = await getAccountExport(session.userId);
  await markAccountExported(session.userId);

  const zip = new JSZip();
  zip.file("README.txt", "Exportación de datos de SOSme (formato JSON)\n");
  zip.file("account.json", JSON.stringify(payload, null, 2));

  const buffer = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  const filename = `sosme-export-${new Date().toISOString().slice(0, 10)}.zip`;
  return new NextResponse(buffer as unknown as BodyInit, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename=\"${filename}\"`,
      "Cache-Control": "no-store",
    },
  });
});

