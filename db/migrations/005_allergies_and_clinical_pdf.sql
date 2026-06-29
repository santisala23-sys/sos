-- Alergias + historial clínico PDF en perfiles QR

ALTER TABLE qr_profiles
  ADD COLUMN IF NOT EXISTS allergies TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS clinical_pdf BYTEA,
  ADD COLUMN IF NOT EXISTS clinical_pdf_filename TEXT,
  ADD COLUMN IF NOT EXISTS clinical_pdf_uploaded_at TIMESTAMPTZ;
