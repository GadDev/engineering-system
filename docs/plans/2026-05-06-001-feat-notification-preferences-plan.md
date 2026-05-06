---
title: "feat: Add Per-User Notification Preferences"
type: feat
status: active
date: 2026-05-06
origin: openspec/changes/notification-preferences/
---

# feat: Add Per-User Notification Preferences

## Summary

Adds a per-user notification preferences system spanning three layers: a database migration adding boolean columns to `user_profiles`, a REST API for reading and partially updating preferences, dispatch-layer enforcement that suppresses muted notification types, and a frontend settings page at `/settings/notifications`. All preferences default to `true` to preserve existing behavior for current users.

---

## Problem Frame

Users currently receive all notification types (new comment, @mention, digest) with no opt-out mechanism, causing notification fatigue and missed high-signal alerts. This change adds server-side preference storage and enforces those preferences at dispatch time.

---

## Requirements

- R1. Users can view the current state of all three notification toggles on `/settings/notifications`
- R2. Users can toggle each notification type (new comment, @mention, digest) independently; changes persist across sessions
- R3. All notification preferences default to `true` for new and existing users
- R4. Notification dispatch MUST NOT send a notification of a given type to a user who has disabled that type
- R5. `GET /users/me/notification-preferences` returns the full preferences object for the authenticated user
- R6. `PATCH /users/me/notification-preferences` accepts a partial body, updates only supplied keys, and returns the full updated preferences object
- R7. Both API endpoints return HTTP 401 for unauthenticated requests; PATCH returns HTTP 400 for unrecognized keys

---

## Scope Boundaries

- No push/SMS or third-party notification channels
- No team-level or organization-level default preferences
- No granular frequency controls (e.g., digest cadence)
- No notification history or read/unread state
- Admin-generated announcements do not bypass preferences in this change (deferred as a separate notification type)
- Digest onboarding emails follow the same preference rules — no special bypass

---

## Context & Research

### Relevant Code and Patterns

- `openspec/changes/notification-preferences/design.md` — key decisions: boolean columns over JSON, single PATCH endpoint, enforcement at dispatch not creation, dedicated settings page
- `openspec/changes/notification-preferences/specs/notification-preferences/spec.md` — full requirement and scenario specification
- No existing application source files; this is a greenfield implementation against the spec

### Institutional Learnings

- None on record in `docs/solutions/` for this area

### External References

- Origin spec artifacts: `openspec/changes/notification-preferences/` (proposal, design, spec, tasks)

---

## Key Technical Decisions

- **Boolean columns over JSON blob**: Three `NOT NULL DEFAULT TRUE` columns on `user_profiles` — directly queryable, DB-enforced defaults, schema is self-documenting. (see origin: openspec/changes/notification-preferences/design.md)
- **Single PATCH endpoint**: One `PATCH /users/me/notification-preferences` accepting any subset of the three keys — simpler client, atomic multi-key updates. (see origin: design.md)
- **Enforce at dispatch, not at record creation**: Notification records are always written; dispatch layer checks preferences before sending. Preserves history for re-enabled types. (see origin: design.md)
- **Dedicated settings page at `/settings/notifications`**: Co-located with other account settings; easy to extend with new types. (see origin: design.md)
- **UI replaces local state with server response**: After PATCH, the UI uses the response body as the source of truth — prevents stale UI on concurrent edits.

---

## Open Questions

### Resolved During Planning

- **Should digest notifications bypass preferences for onboarding emails?** No — preferences apply universally. (see origin: design.md)
- **Do admin announcements bypass preferences?** Out of scope for this change; treat as a separate notification type if needed.

### Deferred to Implementation

- Exact ORM/query syntax for the preference lookup in dispatch — depends on the project's data access layer
- Whether dispatch preference lookup should use a cache (measure first; primary-key read is likely fast enough)
- Exact component library / toggle UI pattern — follow whatever the project's design system provides for boolean controls

---

## High-Level Technical Design

> *This illustrates the intended approach and is directional guidance for review, not implementation specification. The implementing agent should treat it as context, not code to reproduce.*

```
PATCH /users/me/notification-preferences
  body: { "digest": false }
       │
       ▼
  validate keys ──► 400 if unknown key
       │
       ▼
  update user_profiles SET notify_digest = false WHERE id = :user_id
       │
       ▼
  return { new_comment: true, mention: true, digest: false }

Dispatch layer (existing flow, modified):
  notify(recipient, type) {
    prefs = load_prefs(recipient.id)   // single PK lookup
    if !prefs[type]: return            // suppress and exit
    ... existing send logic ...
  }
```

```
Settings page (/settings/notifications)
  mount → GET /users/me/notification-preferences
        → render 3 toggles with server values
  toggle → PATCH with changed key
         → replace state with full response body
         → show error banner on failure
```

---

## Implementation Units

### U1. Database Migration

**Goal:** Add three `NOT NULL DEFAULT TRUE` boolean columns to `user_profiles` and provide a rollback migration.

**Requirements:** R3

**Dependencies:** None

**Files:**
- Create: `db/migrations/<timestamp>_add_notification_preferences_to_user_profiles.sql` (or equivalent migration file for the project's migration tool)
- Create: `db/migrations/<timestamp>_rollback_notification_preferences.sql` (or inline rollback in the same file if the migration tool supports it)

**Approach:**
- Single `ALTER TABLE` statement adding `notify_new_comment`, `notify_mention`, `notify_digest` as `BOOLEAN NOT NULL DEFAULT TRUE`
- All three columns in one migration to keep deploys atomic
- Rollback drops all three columns; no foreign key dependencies, so safe to drop without cascading

**Patterns to follow:**
- Follow the project's existing migration file naming and format convention

**Test scenarios:**
- Happy path: Migration runs on a database with existing `user_profiles` rows; all existing rows have `true` for all three new columns
- Happy path: Fresh database with no rows — migration applies cleanly
- Edge case: Rollback migration drops all three columns without error

**Verification:**
- Migration applies and rolls back without errors
- `DESCRIBE user_profiles` (or equivalent) shows three new boolean columns with `DEFAULT TRUE`
- Existing rows retain their other column values unchanged

---

### U2. User Profile Model and Input Validation

**Goal:** Expose the three preference fields through the user profile model and enforce strict input validation on PATCH requests.

**Requirements:** R2, R7

**Dependencies:** U1

**Files:**
- Modify: `src/models/user_profile` (or equivalent model/entity file)
- Create or modify: `src/validators/notification_preferences_validator` (or inline in the controller/handler)

**Approach:**
- Add `notify_new_comment`, `notify_mention`, `notify_digest` fields to the model's attribute set
- PATCH body validator: accept only the keys `new_comment`, `mention`, `digest` (boolean values); any unknown key returns HTTP 400 with an error message naming the invalid key
- Validation runs before any DB write

**Patterns to follow:**
- Follow existing model attribute declaration patterns in the project
- Follow existing request validation patterns (schema validator, middleware, or controller guard)

**Test scenarios:**
- Happy path: Valid partial body `{ "digest": false }` passes validation
- Happy path: Full body with all three keys passes validation
- Edge case: Empty body `{}` passes validation (no-op update)
- Error path: Body with unknown key `{ "foo": true }` → HTTP 400, error names `foo`
- Error path: Valid key with non-boolean value → HTTP 400

**Verification:**
- Model exposes all three preference fields
- PATCH with an unknown key returns HTTP 400 and the error message identifies the unknown key

---

### U3. Notification Preferences REST API

**Goal:** Implement `GET` and `PATCH` endpoints at `/users/me/notification-preferences`, both requiring authentication.

**Requirements:** R5, R6, R7

**Dependencies:** U1, U2

**Files:**
- Create: `src/routes/notification_preferences` (or add to existing user settings routes file)
- Create: `src/controllers/notification_preferences_controller` (or equivalent handler)
- Modify: `src/routes/index` (or equivalent router entry point) — register the new routes

**Approach:**
- `GET /users/me/notification-preferences`: reads `notify_new_comment`, `notify_mention`, `notify_digest` from `user_profiles` for the authenticated user; maps column names to response keys `new_comment`, `mention`, `digest`; returns HTTP 200 with the JSON object
- `PATCH /users/me/notification-preferences`: runs input validation (U2), applies partial update, returns the full updated preferences object as HTTP 200
- Both routes guarded by the existing authentication middleware; unauthenticated requests receive HTTP 401 before reaching the controller

**Patterns to follow:**
- Follow existing authenticated route registration patterns
- Follow existing controller/handler response patterns (serialization, status codes)

**Test scenarios:**
- Happy path (GET): authenticated request returns `{ new_comment: true, mention: true, digest: true }` for user with defaults
- Happy path (GET): authenticated request reflects stored values when preferences have been changed
- Error path (GET): unauthenticated request → HTTP 401
- Happy path (PATCH): `{ "digest": false }` → updates `notify_digest`, returns full object; `mention` and `new_comment` unchanged
- Happy path (PATCH): multiple keys in one request → all supplied keys updated atomically
- Error path (PATCH): unknown key → HTTP 400
- Error path (PATCH): unauthenticated → HTTP 401
- Integration: PATCH followed by GET returns updated values

**Verification:**
- GET and PATCH routes respond correctly for authenticated requests
- Both routes reject unauthenticated requests with HTTP 401
- PATCH with unknown key returns HTTP 400

---

### U4. Dispatch Enforcement

**Goal:** Modify the notification dispatch layer to read the recipient's preferences and skip sending for suppressed notification types.

**Requirements:** R4

**Dependencies:** U1, U2

**Files:**
- Modify: `src/services/notification_dispatcher` (or equivalent dispatch service/module)
- Modify: `src/services/notification_dispatcher_test` (or equivalent)

**Approach:**
- Before sending, load the recipient's three preference columns (single primary-key lookup on `user_profiles`)
- Map notification type to preference column: `new_comment` → `notify_new_comment`, `mention` → `notify_mention`, `digest` → `notify_digest`
- If the relevant preference is `false`, return early without sending; notification record is still created (preserves history)
- Enforce for all three types; the check is a simple boolean gate before the existing send path

**Patterns to follow:**
- Follow existing pre-send guard patterns in the dispatcher (e.g., existing checks for user existence, email validity)

**Test scenarios:**
- Happy path: `notify_new_comment = true` → dispatcher calls send for a new comment notification
- Happy path: `notify_mention = true` → dispatcher sends @mention notification
- Happy path: `notify_digest = true` → dispatcher sends digest notification
- Error path (suppression): `notify_new_comment = false` → dispatcher does NOT call send; notification record exists but is not delivered
- Error path (suppression): `notify_mention = false` → @mention not delivered
- Error path (suppression): `notify_digest = false` → digest not delivered
- Integration: dispatch is called; preference lookup returns suppressed; send is never invoked (verify with spy/mock on the send call)

**Verification:**
- Dispatcher does not call the send function when the corresponding preference is `false`
- Dispatcher calls the send function when the preference is `true`
- Notification record creation is not affected by preference value

---

### U5. Frontend Settings Page

**Goal:** Build the `/settings/notifications` page with three labeled toggles that read from and write to the preferences API.

**Requirements:** R1, R2, R3

**Dependencies:** U3

**Files:**
- Create: `src/pages/settings/notifications` (or equivalent component/view file)
- Modify: `src/routes` (frontend router) — register `/settings/notifications`
- Create: `src/pages/settings/notifications.test` (or equivalent)

**Approach:**
- On mount, call `GET /users/me/notification-preferences` and set local state from the response
- Render three toggle controls labeled exactly "New Comment", "@Mention", "Digest" with values bound to local state
- On toggle change, call `PATCH /users/me/notification-preferences` with the changed key; replace entire local state with the server response body (not an optimistic merge)
- Show a loading indicator while the initial GET is in flight
- Show an error banner if GET fails on load or PATCH fails on save; do not silently discard errors

**Patterns to follow:**
- Follow the project's existing settings page component structure and design system toggle component
- Follow the project's existing API call patterns (fetch wrapper, axios, etc.)

**Test scenarios:**
- Happy path: Page mounts, GET returns `{ new_comment: true, mention: true, digest: false }` → three toggles render with those values
- Happy path: User toggles "Digest" to on → PATCH called with `{ "digest": true }` → state updated from response
- Happy path: Server response reflects updated value → toggle reflects server truth, not local toggle state
- Edge case: New user — GET returns all `true` → all three toggles show enabled
- Error path (load): GET fails → error banner shown, toggles not rendered
- Error path (save): PATCH fails → error banner shown, previous toggle state preserved

**Verification:**
- Page loads toggle state from GET response
- Toggle interaction triggers correct PATCH payload
- Local state reflects server response after PATCH, not the raw DOM toggle state
- Error states are visible to the user

---

### U6. Tests and Integration Verification

**Goal:** Write the backend unit tests, frontend unit tests, and end-to-end integration test confirming the full preference enforcement flow.

**Requirements:** R1–R7

**Dependencies:** U1–U5

**Files:**
- Create or modify: `tests/api/notification_preferences_test` — API endpoint tests (covers U3 scenarios not already in U3's test file)
- Create or modify: `tests/dispatch/notification_dispatcher_test` — dispatch enforcement tests (covers U4 scenarios)
- Create or modify: `tests/pages/settings/notifications_test` — frontend component tests (covers U5 scenarios)
- Create or modify: `tests/integration/notification_preferences_e2e_test` — end-to-end scenario

**Approach:**
- End-to-end scenario: authenticated user disables `new_comment` via PATCH → a new comment event is triggered → dispatch is called → send is never invoked for that user
- Regression pass: existing notification delivery tests for other users or enabled types still pass
- New user default test: user row created with no explicit preference values → GET returns all `true`

**Test scenarios:**
- Integration: user disables `new_comment` → comment event triggered → notification not delivered to that user
- Integration: user with all preferences enabled → all three notification types delivered normally
- Regression: users without changed preferences still receive notifications as before
- Happy path: new user defaults — all three preferences `true` on first GET

**Verification:**
- All unit and integration tests pass
- Full test suite shows no regressions in existing notification paths

---

## System-Wide Impact

- **Interaction graph:** Notification dispatch is called on comment creation, mention, and digest job — all three now pass through the preference gate. Any new notification types added in the future must be wired into the same gate.
- **Error propagation:** Preference lookup failure in dispatch should fail safe (deliver the notification) or surface an error, not silently suppress — document which behavior the team prefers before implementing.
- **State lifecycle risks:** PATCH response must be authoritative; UI must not merge local toggle state with server response to avoid stale UI after concurrent edits.
- **API surface parity:** No mobile or CLI clients are in scope; if they exist they should consume the same `/users/me/notification-preferences` endpoint.
- **Integration coverage:** The dispatch gate test must use a real or near-real call path — a spy on the send function is the minimum; a mock on the preference lookup is acceptable since the DB behavior is covered in unit tests.
- **Unchanged invariants:** Notification record creation is not changed. Existing notification delivery for users with all preferences `true` (the default) must be identical to pre-change behavior.

---

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Migration deployed while dispatch code is not yet live | Deploy migration first (columns default true); new dispatch code reads the columns. Old dispatch code ignores columns. No window of breakage. |
| Preference lookup adds latency to high-volume dispatch | Single primary-key read; measure before adding a cache. Column is on the same user_profiles row fetched elsewhere in the request lifecycle — consider reading it once and passing it down. |
| Stale UI after concurrent edits | PATCH handler returns full updated state; UI replaces local state with server response, never merges. |
| Unknown notification types bypass the gate silently | Implement dispatch gate as an explicit allowlist for the three known types; unknown types should log a warning so gaps are visible. |

---

## Documentation / Operational Notes

- Deploy order: migration → backend → frontend (each step is backwards-compatible with the prior)
- Rollback: drop the three columns (no foreign keys); revert backend and frontend code
- No feature flag required — defaults preserve existing behavior for all users

---

## Sources & References

- **Origin artifacts:** `openspec/changes/notification-preferences/` (proposal.md, design.md, specs/notification-preferences/spec.md, tasks.md)
- Tasks checklist: `openspec/changes/notification-preferences/tasks.md`
