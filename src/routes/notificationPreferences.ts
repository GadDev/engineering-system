import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import {
  getPreferences,
  patchPreferences,
} from "../controllers/notificationPreferencesController";
import { AuthenticatedRequest } from "../middleware/requireAuth";
import { Response } from "express";

const router = Router();

router.get(
  "/users/me/notification-preferences",
  requireAuth,
  (req, res) => getPreferences(req as AuthenticatedRequest, res as Response)
);

router.patch(
  "/users/me/notification-preferences",
  requireAuth,
  (req, res) => patchPreferences(req as AuthenticatedRequest, res as Response)
);

export default router;
