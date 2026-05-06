## Context

Currently the application sends all notification types (new comment, @mention, digest) to all users with no opt-out mechanism. This creates noise for users who want a subset of notifications. Preferences will be owned by the user profile: stored server-side, readable and patchable via REST, and enforced at dispatch time.

## Goals / Non-Goals

**Goals:**
- Per-user toggle for each of three notification types: new comment, @mention, digest
- Preferences default to `true` (preserve existing behavior for existing users)
- Single PATCH endpoint to update one or more preferences in one request
- Preferences enforced in notification dispatch — suppressed types are never sent
- Settings UI page at `/settings/notifications`

**Non-Goals:**
- Push/SMS or third-party notification channels
- Team-level or organization-level default preferences
- Granular frequency controls (e.g., digest cadence)
- Notification history or read/unread state

## Decisions

### 1. Storage: individual boolean columns over a JSON blob

**Decision**: Add three boolean columns to the user profile table (`notify_new_comment`, `notify_mention`, `notify_digest`), each defaulting to `true`.

**Rationale**: Boolean columns are directly queryable and indexable without JSON parsing, schema is self-documenting, and adding a new notification type later requires only a new migration — not a schema redesign. A JSON blob would require custom validation and makes the `NOT NULL DEFAULT true` contract harder to express at the DB level.

**Alternative considered**: `user_notification_prefs` side table (one row per user per type). Rejected — premature normalization for three known, stable types; would require a join on every dispatch check.

### 2. API: single PATCH endpoint accepting a partial preferences object

**Decision**: `PATCH /users/me/notification-preferences` accepts any subset of the three keys. Response returns the full updated preferences object.

**Rationale**: A single endpoint simplifies the client — one request can toggle multiple types atomically. Partial PATCH (not PUT) means the client only sends what changed.

**Alternative considered**: Separate `PUT /users/me/notification-preferences/:type`. Rejected — more round trips for bulk updates and unnecessary route proliferation.

### 3. Enforcement: check preferences in dispatch layer, not at creation

**Decision**: Notification records are always created; the dispatch layer reads the recipient's preferences before sending and skips suppressed types.

**Rationale**: Separates concerns — notification history is complete regardless of preferences, users can re-enable a type and receive future notifications without data loss. Simpler to audit than skipping record creation.

**Alternative considered**: Skip record creation entirely when preference is off. Rejected — loses notification history if user re-enables.

### 4. Frontend: dedicated settings page, not inline toggles

**Decision**: `/settings/notifications` as a standalone page with a simple toggle list.

**Rationale**: Keeps settings co-located with other account settings. Easier to extend (add new types later) than inline toggles scattered across the UI.

## Risks / Trade-offs

- **Migration affects all users** → Migration must set `DEFAULT true` for all three columns so existing rows are unaffected and the deploy is non-destructive; verify row count before and after
- **Dispatch check adds latency** → Preference lookup is a single primary-key read on a hot table; negligible in practice. Cache at application layer if profiling shows otherwise
- **Stale UI on concurrent edits** → PATCH response returns the full updated state; UI should replace local state with server response, not optimistically merge

## Migration Plan

1. Run migration: `ALTER TABLE user_profiles ADD COLUMN notify_new_comment BOOLEAN NOT NULL DEFAULT TRUE, ADD COLUMN notify_mention BOOLEAN NOT NULL DEFAULT TRUE, ADD COLUMN notify_digest BOOLEAN NOT NULL DEFAULT TRUE`
2. Deploy backend with new endpoint and updated dispatch logic (backwards-compatible — columns have defaults)
3. Deploy frontend settings page
4. Rollback: columns can be dropped without data loss to other tables; no foreign keys involved

## Open Questions

- Should digest notifications be sent even when `notify_digest = false` for onboarding emails? (Assumption for now: no — preferences apply universally)
- Do admin-generated announcements bypass preferences? (Out of scope for this change — treat as a separate notification type if needed later)
