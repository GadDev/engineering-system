import React, { useEffect, useState } from "react";

interface NotificationPreferences {
  new_comment: boolean;
  mention: boolean;
  digest: boolean;
}

const TOGGLE_LABELS: Record<keyof NotificationPreferences, string> = {
  new_comment: "New Comment",
  mention: "@Mention",
  digest: "Digest",
};

export function NotificationPreferencesPage() {
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/users/me/notification-preferences")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load notification preferences.");
        return res.json() as Promise<NotificationPreferences>;
      })
      .then((data) => {
        setPrefs(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  async function handleToggle(key: keyof NotificationPreferences) {
    if (!prefs) return;
    setError(null);

    try {
      const res = await fetch("/users/me/notification-preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: !prefs[key] }),
      });
      if (!res.ok) throw new Error("Failed to save notification preference.");
      const updated = (await res.json()) as NotificationPreferences;
      // Replace state from server response — do not optimistically merge.
      setPrefs(updated);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  if (loading) {
    return <p>Loading notification preferences…</p>;
  }

  return (
    <section>
      <h1>Notification Preferences</h1>

      {error && <p role="alert" className="error">{error}</p>}

      {prefs &&
        (Object.keys(TOGGLE_LABELS) as Array<keyof NotificationPreferences>).map(
          (key) => (
            <label key={key}>
              <input
                type="checkbox"
                checked={prefs[key]}
                onChange={() => handleToggle(key)}
              />
              {TOGGLE_LABELS[key]}
            </label>
          )
        )}
    </section>
  );
}
