import { NextResponse } from "next/server";
import { getSql } from "@/lib/db/index";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

const LOG_PREFIX = "[internal/read-status]";
const DB_QUERY_TIMEOUT_MS = 12_000;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(
      () => reject(new Error(`Consulta DB agotó el tiempo (${ms}ms)`)),
      ms,
    );
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
  }
}

export async function GET(_request: Request, { params }: RouteContext) {
  // TEMPORAL: auth deshabilitada para debug — restaurar antes de producción estable.
  // const expectedKey = process.env.INTERNAL_N8N_KEY;
  // if (!expectedKey) {
  //   return NextResponse.json(
  //     { error: "Endpoint interno no configurado" },
  //     { status: 500 },
  //   );
  // }
  //
  // const providedKey = request.headers.get("x-n8n-api-key");
  // if (!providedKey || providedKey !== expectedKey) {
  //   return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  // }
  //
  // console.log(`${LOG_PREFIX} API key validada OK`);

  console.log(`${LOG_PREFIX} Auth omitida (temporal), consultando DB...`);

  let id: string;
  try {
    ({ id } = await params);
  } catch (error) {
    console.error(`${LOG_PREFIX} Error resolviendo params`, error);
    return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 });
  }

  if (!id || !UUID_RE.test(id)) {
    return NextResponse.json({ error: "id inválido" }, { status: 400 });
  }

  if (!process.env.DATABASE_URL) {
    console.error(`${LOG_PREFIX} DATABASE_URL no configurada`);
    return NextResponse.json({ error: "Error interno de DB" }, { status: 500 });
  }

  console.log(`${LOG_PREFIX} Consultando DB para scan_log id=${id}`);

  try {
    const sql = getSql();
    const rows = (await withTimeout(
      sql`
        SELECT read_at
        FROM scan_logs
        WHERE id = ${id}
        LIMIT 1
      `,
      DB_QUERY_TIMEOUT_MS,
    )) as { read_at: string | null }[];

    console.log(`${LOG_PREFIX} DB respondió, filas=${rows.length}`);

    const row = rows[0];
    if (!row) {
      return NextResponse.json(
        { error: "Scan log no encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json({ read_at: row.read_at });
  } catch (error) {
    console.error(`${LOG_PREFIX} Error de DB:`, error);
    return NextResponse.json({ error: "Error interno de DB" }, { status: 500 });
  }
}
