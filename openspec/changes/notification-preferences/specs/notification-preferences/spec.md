## ADDED Requirements

### Requirement: User can view notification preferences
The system SHALL display the current state of all notification toggles (new comment, @mention, digest) on the notification settings page at `/settings/notifications`.

#### Scenario: Page loads with current preferences
- **WHEN** an authenticated user navigates to `/settings/notifications`
- **THEN** the page displays three toggle controls labeled "New Comment", "@Mention", and "Digest", each reflecting the user's stored preference

#### Scenario: New user sees all preferences enabled by default
- **WHEN** a user accesses the settings page for the first time with no previously saved preferences
- **THEN** all three toggles are shown in the enabled (on) state

---

### Requirement: User can toggle individual notification types
The system SHALL allow the authenticated user to enable or disable each notification type independently.

#### Scenario: User disables a notification type
- **WHEN** the user toggles a notification type from on to off and saves
- **THEN** the system persists the disabled state and the toggle remains off on subsequent page loads

#### Scenario: User re-enables a notification type
- **WHEN** the user toggles a previously disabled notification type back to on and saves
- **THEN** the system persists the enabled state and the toggle reflects on on subsequent page loads

#### Scenario: Partial update does not affect other preferences
- **WHEN** the user changes only one notification toggle and saves
- **THEN** the other two notification preferences remain unchanged

---

### Requirement: Notification preferences are enforced at dispatch
The system SHALL NOT send a notification of a given type to a user whose preference for that type is disabled.

#### Scenario: Notification suppressed when type is disabled
- **WHEN** a notification of type X is triggered for a user who has type X disabled
- **THEN** the notification is not delivered to that user

#### Scenario: Notification delivered when type is enabled
- **WHEN** a notification of type X is triggered for a user who has type X enabled
- **THEN** the notification is delivered to that user through the normal dispatch path

---

### Requirement: Preferences API supports read and partial update
The system SHALL expose `GET /users/me/notification-preferences` to read preferences and `PATCH /users/me/notification-preferences` to update one or more preference values in a single request.

#### Scenario: GET returns full preferences object
- **WHEN** an authenticated user calls `GET /users/me/notification-preferences`
- **THEN** the response body contains a JSON object with keys `new_comment`, `mention`, and `digest`, each with a boolean value

#### Scenario: PATCH updates specified preferences and returns full object
- **WHEN** an authenticated user calls `PATCH /users/me/notification-preferences` with a partial body (e.g., `{ "digest": false }`)
- **THEN** the system updates only the supplied keys, persists the change, and returns the full updated preferences object

#### Scenario: PATCH with invalid key is rejected
- **WHEN** an authenticated user calls `PATCH /users/me/notification-preferences` with an unrecognized key
- **THEN** the system responds with HTTP 400 and an error message identifying the invalid key

#### Scenario: Unauthenticated request is rejected
- **WHEN** a request is made to either preferences endpoint without a valid session
- **THEN** the system responds with HTTP 401
