export interface UserProfile {
  id: string;
  email: string;
  notify_new_comment: boolean;
  notify_mention: boolean;
  notify_digest: boolean;
}

export interface NotificationPreferences {
  new_comment: boolean;
  mention: boolean;
  digest: boolean;
}

/** Maps DB column names to API response keys. */
export function toPreferencesDTO(profile: UserProfile): NotificationPreferences {
  return {
    new_comment: profile.notify_new_comment,
    mention: profile.notify_mention,
    digest: profile.notify_digest,
  };
}
