import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/requireAuth";
import { toPreferencesDTO } from "../models/userProfile";
import { validatePreferencesPatch } from "../validators/notificationPreferencesValidator";
import { db } from "../db";

export async function getPreferences(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const profile = await db.userProfiles.findById(req.userId);
  res.json(toPreferencesDTO(profile));
}

export async function patchPreferences(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  const validation = validatePreferencesPatch(req.body);
  if (!validation.valid) {
    res.status(400).json({ error: validation.message });
    return;
  }

  const patch = req.body as {
    new_comment?: boolean;
    mention?: boolean;
    digest?: boolean;
  };

  const columnMap: Record<string, string> = {
    new_comment: "notify_new_comment",
    mention: "notify_mention",
    digest: "notify_digest",
  };

  const updates: Record<string, boolean> = {};
  for (const [key, col] of Object.entries(columnMap)) {
    if (key in patch) {
      updates[col] = patch[key as keyof typeof patch]!;
    }
  }

  if (Object.keys(updates).length > 0) {
    await db.userProfiles.update(req.userId, updates);
  }

  const updated = await db.userProfiles.findById(req.userId);
  res.json(toPreferencesDTO(updated));
}
