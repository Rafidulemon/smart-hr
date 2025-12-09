-- Rename slug column to subDomain for clarity
ALTER TABLE "Organization" RENAME COLUMN "slug" TO "subDomain";

-- Recreate unique index to match the new column name
DROP INDEX IF EXISTS "Organization_slug_key";
CREATE UNIQUE INDEX IF NOT EXISTS "Organization_subDomain_key" ON "Organization"("subDomain");
