-- Table to track per-year sequence counters for MRN generation
CREATE TABLE IF NOT EXISTS mrn_sequences (
  year INTEGER PRIMARY KEY,
  last_value BIGINT NOT NULL DEFAULT 0
);

-- Function to generate the next MRN for the current year
CREATE OR REPLACE FUNCTION generate_mrn()
RETURNS TEXT AS $$
DECLARE
  current_year INTEGER;
  next_value BIGINT;
  new_mrn TEXT;
BEGIN
  current_year := EXTRACT(YEAR FROM NOW());

  -- Lock the row for this year to prevent race conditions
  -- across concurrent inserts. If no row exists yet, create one.
  INSERT INTO mrn_sequences (year, last_value)
  VALUES (current_year, 0)
  ON CONFLICT (year) DO NOTHING;

  UPDATE mrn_sequences
  SET last_value = last_value + 1
  WHERE year = current_year
  RETURNING last_value INTO next_value;

  new_mrn := 'HLX-' || current_year || '-' || LPAD(next_value::TEXT, 6, '0');

  RETURN new_mrn;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to assign MRN on patient insert
CREATE OR REPLACE FUNCTION assign_mrn()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.mrn IS NULL OR NEW.mrn = '' THEN
    NEW.mrn := generate_mrn();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_assign_mrn ON patients;

CREATE TRIGGER trg_assign_mrn
BEFORE INSERT ON patients
FOR EACH ROW
EXECUTE FUNCTION assign_mrn();

-- Ensure MRN uniqueness at the database level as a hard safety net
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'patients_mrn_unique'
  ) THEN
    ALTER TABLE patients
    ADD CONSTRAINT patients_mrn_unique UNIQUE (mrn);
  END IF;
END $$;