-- Plantillas de imprenta (layout JSON + dimensiones configurables)

CREATE TABLE IF NOT EXISTS print_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  page_width_mm NUMERIC(6, 2) NOT NULL DEFAULT 40,
  page_height_mm NUMERIC(6, 2) NOT NULL DEFAULT 40,
  layout_json JSONB NOT NULL DEFAULT '{"version":1,"elements":[]}'::jsonb,
  cut_layer_enabled BOOLEAN NOT NULL DEFAULT true,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_print_templates_slug ON print_templates (slug);
CREATE INDEX IF NOT EXISTS idx_print_templates_default ON print_templates (is_default) WHERE is_default = true;

ALTER TABLE qr_product_batches
  ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES print_templates (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_qr_product_batches_template ON qr_product_batches (template_id);

-- Plantilla llavero 40×40 mm (equivalente al layout Canva existente)
INSERT INTO print_templates (
  name,
  slug,
  page_width_mm,
  page_height_mm,
  layout_json,
  cut_layer_enabled,
  is_default
)
VALUES (
  'Llavero 40×40',
  'llavero-40x40',
  40,
  40,
  '{
    "version": 1,
    "elements": [
      {
        "id": "bg",
        "type": "background",
        "assetUrl": "/templates/llavero-40x40.png"
      },
      {
        "id": "qr",
        "type": "qr",
        "xMm": 8.47,
        "yMm": 8.47,
        "sizeMm": 22.2
      },
      {
        "id": "cut-circle",
        "type": "cut_circle",
        "centerXMm": 20,
        "centerYMm": 20,
        "radiusMm": 20
      },
      {
        "id": "cut-hole",
        "type": "cut_hole",
        "xMm": 20,
        "yMm": 40,
        "radiusMm": 1.5
      }
    ]
  }'::jsonb,
  true,
  true
)
ON CONFLICT (slug) DO NOTHING;
