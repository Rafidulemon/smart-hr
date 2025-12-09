-- Add slug column allowing null temporarily
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "slug" TEXT;

-- Populate slug for existing rows using slugified name
UPDATE "Organization"
SET "slug" = lower(regexp_replace(coalesce("name", ''), '[^a-z0-9]+', '-', 'g'))
WHERE ("slug" IS NULL OR trim("slug") = '');

-- Fallback to unique slug if still empty
UPDATE "Organization"
SET "slug" = concat('org-', substr(md5(id::text), 1, 8))
WHERE ("slug" IS NULL OR trim("slug") = '');

-- Enforce not null & uniqueness
ALTER TABLE "Organization"
ALTER COLUMN "slug" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "Organization_slug_key" ON "Organization"("slug");
