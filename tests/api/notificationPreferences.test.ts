import { validatePreferencesPatch } from "../../src/validators/notificationPreferencesValidator";

describe("validatePreferencesPatch", () => {
  it("accepts a valid partial body", () => {
    expect(validatePreferencesPatch({ digest: false })).toEqual({ valid: true });
  });

  it("accepts a full body with all three keys", () => {
    expect(
      validatePreferencesPatch({ new_comment: true, mention: false, digest: true })
    ).toEqual({ valid: true });
  });

  it("accepts an empty body (no-op update)", () => {
    expect(validatePreferencesPatch({})).toEqual({ valid: true });
  });

  it("rejects an unknown key and names it in the message", () => {
    const result = validatePreferencesPatch({ foo: true });
    expect(result.valid).toBe(false);
    expect(result.invalidKey).toBe("foo");
    expect(result.message).toContain('"foo"');
  });

  it("rejects a non-boolean value", () => {
    const result = validatePreferencesPatch({ digest: "yes" });
    expect(result.valid).toBe(false);
    expect(result.message).toContain('"digest"');
  });

  it("rejects a non-object body", () => {
    expect(validatePreferencesPatch(null)).toEqual(
      expect.objectContaining({ valid: false })
    );
    expect(validatePreferencesPatch("string")).toEqual(
      expect.objectContaining({ valid: false })
    );
    expect(validatePreferencesPatch([1, 2])).toEqual(
      expect.objectContaining({ valid: false })
    );
  });
});

describe("toPreferencesDTO", () => {
  it("maps DB column names to API response keys", async () => {
    const { toPreferencesDTO } = await import("../../src/models/userProfile");
    const profile = {
      id: "u1",
      email: "a@b.com",
      notify_new_comment: true,
      notify_mention: false,
      notify_digest: true,
    };
    expect(toPreferencesDTO(profile)).toEqual({
      new_comment: true,
      mention: false,
      digest: true,
    });
  });
});
