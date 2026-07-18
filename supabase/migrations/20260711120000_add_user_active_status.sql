-- =========================================================
-- USER PROFILES: active/deactivated status
-- Added to support the Administration dashboard's ability to
-- deactivate a user's access without deleting their account.
--
-- IMPORTANT: as of this migration, deactivation is enforced
-- client-side only (App.jsx signs the user out on login if
-- is_active = false). A follow-up should also enforce this at
-- the RLS level on clinical tables for defense in depth — a
-- deactivated user's still-valid session token would otherwise
-- continue to satisfy existing RLS policies until it expires.
-- =========================================================
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;