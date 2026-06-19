-- PostgreSQL Full-Text Search for TalentDash
-- Adds tsvector columns for efficient full-text search on company names and role titles.
-- Phase 1 of the search strategy as documented in the tech stack.

-- Add tsvector column to Company model for company name search
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create GIN index for fast full-text search queries
CREATE INDEX IF NOT EXISTS company_search_idx ON "Company" USING GIN(search_vector);

-- Trigger function to auto-update the tsvector when company name changes
CREATE OR REPLACE FUNCTION company_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', COALESCE(NEW.name, '') || ' ' || COALESCE(NEW.normalized_name, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trg_company_search_vector ON "Company";
CREATE TRIGGER trg_company_search_vector
  BEFORE INSERT OR UPDATE OF name, normalized_name
  ON "Company"
  FOR EACH ROW
  EXECUTE FUNCTION company_search_vector_update();

-- Update existing rows
UPDATE "Company" SET search_vector = to_tsvector('english', COALESCE(name, '') || ' ' || COALESCE(normalized_name, ''));
