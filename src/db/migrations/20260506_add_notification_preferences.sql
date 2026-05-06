-- Migration: add notification preference columns to user_profiles
-- Each column defaults to TRUE so existing rows are unaffected on deploy.

ALTER TABLE user_profiles
  ADD COLUMN notify_new_comment BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN notify_mention     BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN notify_digest      BOOLEAN NOT NULL DEFAULT TRUE;
