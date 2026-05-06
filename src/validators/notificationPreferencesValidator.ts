export type PreferencesPatch = Partial<{
  new_comment: boolean;
  mention: boolean;
  digest: boolean;
}>;

const ALLOWED_KEYS = new Set(["new_comment", "mention", "digest"]);

export interface ValidationResult {
  valid: boolean;
  invalidKey?: string;
  message?: string;
}

export function validatePreferencesPatch(body: unknown): ValidationResult {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return { valid: false, message: "Request body must be a JSON object." };
  }

  for (const key of Object.keys(body as Record<string, unknown>)) {
    if (!ALLOWED_KEYS.has(key)) {
      return {
        valid: false,
        invalidKey: key,
        message: `Unknown preference key: "${key}". Allowed keys are: new_comment, mention, digest.`,
      };
    }
    const value = (body as Record<string, unknown>)[key];
    if (typeof value !== "boolean") {
      return {
        valid: false,
        message: `Value for "${key}" must be a boolean.`,
      };
    }
  }

  return { valid: true };
}
