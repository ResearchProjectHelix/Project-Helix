-- =========================================================
-- BLOOD_TESTS: add unit and reference range
-- Needed so Blood Results can show clinically meaningful
-- context instead of a bare number and a NORMAL/ABNORMAL flag.
-- =========================================================
ALTER TABLE blood_tests
  ADD COLUMN IF NOT EXISTS unit TEXT,
  ADD COLUMN IF NOT EXISTS reference_range TEXT;