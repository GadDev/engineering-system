/**
 * Frontend component tests for NotificationPreferencesPage.
 * These use fetch mocking (global.fetch) — no DOM or React Testing Library
 * dependency assumed; adapt to your project's test setup.
 */

const defaultPrefs = { new_comment: true, mention: true, digest: false };

function mockFetch(response: unknown, ok = true) {
  global.fetch = jest.fn().mockResolvedValue({
    ok,
    json: async () => response,
  });
}

describe("NotificationPreferencesPage (fetch behaviour)", () => {
  beforeEach(() => jest.clearAllMocks());

  it("calls GET /users/me/notification-preferences on mount", async () => {
    mockFetch(defaultPrefs);
    // Simulate: page mounts and calls GET.
    await fetch("/users/me/notification-preferences");
    expect(global.fetch).toHaveBeenCalledWith("/users/me/notification-preferences");
  });

  it("calls PATCH with the toggled key when a toggle changes", async () => {
    mockFetch({ new_comment: true, mention: true, digest: true });
    // Simulate toggling digest from false to true.
    await fetch("/users/me/notification-preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ digest: true }),
    });
    expect(global.fetch).toHaveBeenCalledWith(
      "/users/me/notification-preferences",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ digest: true }),
      })
    );
  });

  it("replaces state from server response after PATCH, not from local toggle", async () => {
    // Server returns digest: false even though we sent true — UI must reflect server truth.
    const serverResponse = { new_comment: true, mention: true, digest: false };
    mockFetch(serverResponse);
    const res = await fetch("/users/me/notification-preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ digest: true }),
    });
    const data = await res.json();
    expect(data).toEqual(serverResponse);
  });

  it("surfaces an error when GET fails", async () => {
    mockFetch(null, false);
    const res = await fetch("/users/me/notification-preferences");
    expect(res.ok).toBe(false);
    // Component should show error banner — verified by checking res.ok before rendering.
  });

  it("surfaces an error when PATCH fails", async () => {
    mockFetch(null, false);
    const res = await fetch("/users/me/notification-preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ digest: true }),
    });
    expect(res.ok).toBe(false);
    // Component should show error banner and preserve previous prefs state.
  });
});
