import { Request, Response, NextFunction } from "express";

export interface AuthenticatedRequest extends Request {
  userId: string;
}

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const userId = (req as AuthenticatedRequest).userId;
  if (!userId) {
    res.status(401).json({ error: "Authentication required." });
    return;
  }
  next();
}
