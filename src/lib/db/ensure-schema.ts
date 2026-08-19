import { getSql } from "@/lib/db/index";

let deferredMigrationsReady: Promise<void> | null = null;

/**
 * Aplica en caliente migraciones 031/032 si aún no corrieron en prod.
 * Idempotente: seguro llamarlo antes de leer qr_profiles o guardar ubicaciones.
 */
export function ensureDeferredMigrations(): Promise<void> {
  if (!deferredMigrationsReady) {
    deferredMigrationsReady = applyDeferredMigrations().catch((error) => {
      deferredMigrationsReady = null;
      throw error;
    });
  }
  return deferredMigrationsReady;
}

async function applyDeferredMigrations(): Promise<void> {
  const sql = getSql();

  await sql`
    ALTER TABLE qr_profiles
      ADD COLUMN IF NOT EXISTS pet_breed TEXT,
      ADD COLUMN IF NOT EXISTS pet_birth_date DATE
  `;

  await sql`
    DO $$ BEGIN
      ALTER TABLE qr_profiles
        ADD CONSTRAINT qr_profiles_pet_breed_len
        CHECK (pet_breed IS NULL OR char_length(btrim(pet_breed)) BETWEEN 1 AND 120);
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS pet_weight_entries (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      pet_id UUID NOT NULL REFERENCES qr_profiles (id) ON DELETE CASCADE,
      weight_kg NUMERIC(6, 2) NOT NULL,
      recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      source TEXT NOT NULL,
      visit_id UUID REFERENCES pet_vet_visits (id) ON DELETE SET NULL,
      notes TEXT NOT NULL DEFAULT '',
      vet_name TEXT,
      CONSTRAINT pet_weight_entries_source_check
        CHECK (source IN ('tutor', 'vet')),
      CONSTRAINT pet_weight_entries_kg_range
        CHECK (weight_kg > 0 AND weight_kg <= 200),
      CONSTRAINT pet_weight_entries_notes_len
        CHECK (char_length(notes) <= 500)
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS pet_weight_entries_pet_id_idx
      ON pet_weight_entries (pet_id, recorded_at DESC)
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS object_saved_locations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      profile_id UUID NOT NULL REFERENCES qr_profiles(id) ON DELETE CASCADE,
      latitude NUMERIC NOT NULL,
      longitude NUMERIC NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_object_saved_locations_profile_created
      ON object_saved_locations (profile_id, created_at DESC)
  `;

  await sql`
    ALTER TABLE qr_profiles DROP CONSTRAINT IF EXISTS qr_profiles_slug_format
  `;

  await sql`
    DO $$ BEGIN
      ALTER TABLE qr_profiles
        ADD CONSTRAINT qr_profiles_slug_format CHECK (
          slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
          OR slug ~ '^[A-Za-z0-9_-]{21}$'
        );
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$
  `;

  await sql`
    ALTER TABLE qr_profiles
      ADD COLUMN IF NOT EXISTS health_insurance TEXT
  `;

  await sql`
    DO $$ BEGIN
      ALTER TABLE qr_profiles
        ADD CONSTRAINT qr_profiles_health_insurance_len
        CHECK (
          health_insurance IS NULL
          OR char_length(btrim(health_insurance)) BETWEEN 1 AND 200
        );
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$
  `;
}
