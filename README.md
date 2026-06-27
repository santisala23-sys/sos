# SOS — Sistema de Asistencia y Emergencia QR

Web app responsive para que familias configuren perfiles de asistencia accesibles mediante código QR. Al escanear, personal de emergencia ve instrucciones claras y puede llamar al contacto; la familia recibe alertas automáticas.

## Stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS** (mobile-first, alto contraste)
- **Neon PostgreSQL** + `@neondatabase/serverless`
- **Auth propia** (JWT en cookie httpOnly + bcrypt)
- **Lucide React** · **react-qr-code**

## Inicio rápido

### 1. Variables de entorno

```bash
cp .env.local.example .env.local
```

Completá en [Neon Console](https://console.neon.tech):

- `DATABASE_URL` — preferí el **pooler host** para serverless
- `AUTH_SECRET` — string aleatorio largo (ej. `openssl rand -base64 32`)

### 2. Base de datos

```bash
npm run db:migrate
```

Aplica `db/migrations/001_initial_schema.sql` en tu proyecto Neon.

### 3. Desarrollo

```bash
npm install
npm run dev
```

## Rutas

| Ruta | Descripción |
|------|-------------|
| `/` | Landing |
| `/login`, `/register` | Auth tutores |
| `/dashboard` | CRUD perfiles + descarga QR |
| `/p/[slug]` | Vista pública de emergencia |
| `/api/auth/*` | Login, registro, logout |
| `/api/qr-profiles` | CRUD perfiles (autenticado) |
| `/api/alerts/*` | Escaneos, GPS y SOS |

## Modelo de datos (Neon)

- **`users`** — tutores (email, password_hash, full_name)
- **`qr_profiles`** — perfiles QR públicos
- **`scan_logs`** — historial de escaneos y SOS

## Alertas (MVP)

Las alertas se registran en consola del servidor. Configurá `ALERT_WEBHOOK_URL` para integrar n8n, Make, email, etc.

## Despliegue (Vercel)

1. Conectá el repo en Vercel
2. Agregá `DATABASE_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_APP_URL`
3. Ejecutá `npm run db:migrate` una vez contra la DB de producción
