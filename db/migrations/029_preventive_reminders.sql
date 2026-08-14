-- Recordatorios push de vacunas / desparasitaciones.
-- Guardamos la fecha de vencimiento para la que ya se envió cada aviso,
-- así al cambiar next_due_at se pueden volver a enviar.

ALTER TABLE pet_preventive_items
  ADD COLUMN IF NOT EXISTS reminder_3d_sent_for DATE,
  ADD COLUMN IF NOT EXISTS reminder_due_sent_for DATE;

CREATE INDEX IF NOT EXISTS pet_preventive_items_due_reminder_idx
  ON pet_preventive_items (next_due_at)
  WHERE next_due_at IS NOT NULL;
