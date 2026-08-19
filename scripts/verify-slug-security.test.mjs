/**
 * Verificación offline del constraint dual de slugs y helpers de contacto.
 * Ejecutar: npm run test:security
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const LEGACY = /^[a-z0-9]+(-[a-z0-9]+)+$/;
const OPAQUE = /^[A-Za-z0-9_-]{21}$/;

function isLegacySlug(slug) {
  return LEGACY.test(slug);
}

function isOpaqueSlug(slug) {
  return OPAQUE.test(slug);
}

function isValidProfileSlug(slug) {
  return isLegacySlug(slug) || isOpaqueSlug(slug);
}

function buildTelUrl(phone) {
  return `tel:${phone.replace(/\s/g, "")}`;
}

describe("slug constraint dual", () => {
  const legacySamples = [
    "juan-perez-a3f2",
    "maria-garcia-1234",
    "producto-abc123",
    "perfil-x",
  ];

  for (const slug of legacySamples) {
    it(`acepta slug legado: ${slug}`, () => {
      assert.equal(isValidProfileSlug(slug), true);
      assert.equal(isLegacySlug(slug), true);
      assert.equal(isOpaqueSlug(slug), false);
    });
  }

  const opaqueSamples = [
    "V1StGXR8_Z5jdHi6B-myT",
    "0123456789abcdefghijk",
    "ABCDEFGHIJKLMNOPQRSTU",
  ];

  for (const slug of opaqueSamples) {
    it(`acepta slug opaco: ${slug}`, () => {
      assert.equal(isValidProfileSlug(slug), true);
      assert.equal(isOpaqueSlug(slug), true);
    });
  }

  const rejected = [
    "",
    "abc",
    "Juan-Perez",
    "slug con espacios",
    "a".repeat(20),
  ];

  for (const slug of rejected) {
    it(`rechaza slug inválido: ${JSON.stringify(slug)}`, () => {
      assert.equal(isValidProfileSlug(slug), false);
    });
  }
});

describe("contact links", () => {
  it("telUrl no incluye espacios", () => {
    assert.equal(buildTelUrl("+54 9 11 2233 4455"), "tel:+5491122334455");
  });

  it("wa.me no aparece en HTML estático del perfil", () => {
    const pageSource = readFileSync(
      join(root, "src/components/public/ContactActions.tsx"),
      "utf8",
    );
    assert.doesNotMatch(pageSource, /wa\.me\/\d/);
    assert.doesNotMatch(pageSource, /tel:\+\d/);
  });
});

describe("migración 033", () => {
  it("no contiene UPDATE destructivo sobre slugs existentes", () => {
    const sql = readFileSync(
      join(root, "db/migrations/033_slug_nanoid.sql"),
      "utf8",
    );
    assert.doesNotMatch(sql, /\bUPDATE\s+qr_profiles\b/i);
    assert.match(sql, /qr_profiles_slug_format/);
  });
});
