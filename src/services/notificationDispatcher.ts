import { db } from "../db";

export type NotificationType = "new_comment" | "mention" | "digest";

/** Maps notification type to the preference column on user_profiles. */
const PREF_COLUMN: Record<NotificationType, "notify_new_comment" | "notify_mention" | "notify_digest"> = {
  new_comment: "notify_new_comment",
  mention: "notify_mention",
  digest: "notify_digest",
};

export interface NotificationRecord {
  id: string;
  recipientId: string;
  type: NotificationType;
  payload: unknown;
}

/**
 * Sends a notification only when the recipient has the relevant type enabled.
 * The notification record is always created; this gate only controls delivery.
 */
export async function dispatch(
  record: NotificationRecord,
  send: (record: NotificationRecord) => Promise<void>
): Promise<void> {
  const profile = await db.userProfiles.findById(record.recipientId);
  const column = PREF_COLUMN[record.type];

  if (!profile[column]) {
    // Preference disabled — record exists but delivery is suppressed.
    return;
  }

  await send(record);
}
