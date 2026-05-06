## Why

Users have no control over which notifications they receive, leading to noise fatigue and missed important alerts. Adding per-user preference controls lets users opt in or out of each notification type, improving engagement and retention.

## What Changes

- Add a notification preferences page in user settings where users can toggle each notification type on/off
- Introduce three toggleable notification types: new comment, @mention, and digest
- Persist preferences per-user in the user profile table (new columns)
- Enforce preferences at notification dispatch time — suppressed types are never sent
- Expose a REST endpoint for reading and updating preferences

## Capabilities

### New Capabilities

- `notification-preferences`: Per-user toggle settings for notification types (new comment, @mention, digest), stored in the user profile table and surfaced via a dedicated settings UI page and REST API

### Modified Capabilities

<!-- None — no existing spec-level requirements are changing -->

## Impact

- **Database**: New columns on user profile table (`notify_new_comment`, `notify_mention`, `notify_digest`), defaulting to `true`
- **Backend**: New API endpoint (`GET /users/me/notification-preferences`, `PATCH /users/me/notification-preferences`); notification dispatch logic reads preferences before sending
- **Frontend**: New settings page at `/settings/notifications`; no changes to existing notification rendering
- **Dependencies**: No new external dependencies
