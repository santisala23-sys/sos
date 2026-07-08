-- Lienzo blanco (sin capa background) y soporte de corte rectangular

UPDATE print_templates
SET layout_json = jsonb_set(
  layout_json,
  '{elements}',
  COALESCE(
    (
      SELECT jsonb_agg(elem)
      FROM jsonb_array_elements(layout_json->'elements') AS elem
      WHERE elem->>'type' <> 'background'
    ),
    '[]'::jsonb
  )
)
WHERE layout_json->'elements' IS NOT NULL;

UPDATE print_templates
SET layout_json = '{
  "version": 1,
  "elements": [
    {
      "id": "qr",
      "type": "qr",
      "xMm": 8.9,
      "yMm": 8.9,
      "sizeMm": 22.2
    },
    {
      "id": "cut-rect",
      "type": "cut_rect",
      "xMm": 0,
      "yMm": 0,
      "widthMm": 40,
      "heightMm": 40
    },
    {
      "id": "cut-hole",
      "type": "cut_hole",
      "xMm": 20,
      "yMm": 40,
      "radiusMm": 1.5
    }
  ]
}'::jsonb
WHERE slug = 'llavero-40x40';
