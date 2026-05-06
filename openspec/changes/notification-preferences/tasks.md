## 1. Database Migration

- [x] 1.1 Write migration to add `notify_new_comment`, `notify_mention`, `notify_digest` boolean columns to `user_profiles` table, each `NOT NULL DEFAULT TRUE`
- [x] 1.2 Verify migration runs cleanly and all existing rows have `true` for all three columns
- [x] 1.3 Add rollback migration (DROP COLUMN for each)

## 2. Backend — Data Model

- [x] 2.1 Update user profile model/entity to include the three preference fields
- [x] 2.2 Add input validation: PATCH body accepts only `new_comment`, `mention`, `digest` keys (boolean values); reject unknown keys with HTTP 400

## 3. Backend — API Endpoints

- [x] 3.1 Implement `GET /users/me/notification-preferences` — returns `{ new_comment, mention, digest }` for the authenticated user; returns 401 for unauthenticated requests
- [x] 3.2 Implement `PATCH /users/me/notification-preferences` — partially updates the supplied keys, persists to DB, returns full updated preferences object; returns 401 for unauthenticated requests

## 4. Backend — Dispatch Enforcement

- [x] 4.1 Update notification dispatch logic to read recipient's preferences before sending
- [x] 4.2 Skip dispatch for `new_comment` notifications when recipient has `notify_new_comment = false`
- [x] 4.3 Skip dispatch for `mention` notifications when recipient has `notify_mention = false`
- [x] 4.4 Skip dispatch for `digest` notifications when recipient has `notify_digest = false`

## 5. Backend — Tests

- [x] 5.1 Unit test: GET endpoint returns correct preferences for authenticated user
- [x] 5.2 Unit test: GET returns 401 for unauthenticated request
- [x] 5.3 Unit test: PATCH updates only supplied keys, returns full object
- [x] 5.4 Unit test: PATCH returns 400 for unrecognized key
- [x] 5.5 Unit test: PATCH returns 401 for unauthenticated request
- [x] 5.6 Unit test: dispatch skips notification when relevant preference is disabled
- [x] 5.7 Unit test: dispatch sends notification when preference is enabled

## 6. Frontend — Settings Page

- [x] 6.1 Create settings page component at `/settings/notifications`
- [x] 6.2 Fetch and display current preferences on page load (GET endpoint)
- [x] 6.3 Render three labeled toggle controls: "New Comment", "@Mention", "Digest"
- [x] 6.4 On toggle change, call PATCH endpoint with updated key; replace local state with server response
- [x] 6.5 Handle loading and error states (failed fetch, failed save)

## 7. Frontend — Tests

- [x] 7.1 Test: page renders all three toggles with values from GET response
- [x] 7.2 Test: toggling a control calls PATCH with the correct key/value
- [x] 7.3 Test: UI reflects server response after save (not just local toggle state)
- [x] 7.4 Test: error state is shown when PATCH fails

## 8. Integration & Verification

- [x] 8.1 End-to-end test: user disables a notification type, triggering event does not result in delivery
- [x] 8.2 Verify new user defaults: all three preferences are `true` on first load
- [x] 8.3 Run full test suite; confirm no regressions in existing notification flows
