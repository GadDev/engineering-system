-- Rollback: remove notification preference columns from user_profiles
-- No foreign keys involved; safe to drop without cascading.

ALTER TABLE user_profiles
  DROP COLUMN IF EXISTS notify_new_comment,
  DROP COLUMN IF EXISTS notify_mention,
  DROP COLUMN IF EXISTS notify_digest;
