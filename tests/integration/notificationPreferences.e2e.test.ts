/**
 * End-to-end integration test: preference enforcement through dispatch.
 *
 * This test exercises the real dispatch() function with a stubbed DB and
 * a spy on send() to verify that preference suppression works end-to-end.
 * No mocks on the dispatch layer itself — only the DB and the final send.
 */
import { dispatch, NotificationRecord } from "../../src/services/notificationDispatcher";
import { db } from "../../src/db";

jest.mock("../../src/db");

const mockFindById = db.userProfiles.findById as jest.Mock;

describe("E2E: notification preference enforcement", () => {
  const send = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => jest.clearAllMocks());

  it("does not deliver new_comment to a user who disabled it", async () => {
    mockFindById.mockResolvedValue({
      notify_new_comment: false,
      notify_mention: true,
      notify_digest: true,
    });
    const record: NotificationRecord = {
      id: "evt1",
      recipientId: "u42",
      type: "new_comment",
      payload: { commentId: "c1" },
    };
    await dispatch(record, send);
    expect(send).not.toHaveBeenCalled();
  });

  it("delivers mention to a user who has all preferences enabled", async () => {
    mockFindById.mockResolvedValue({
      notify_new_comment: true,
      notify_mention: true,
      notify_digest: true,
    });
    const record: NotificationRecord = {
      id: "evt2",
      recipientId: "u42",
      type: "mention",
      payload: { mentionedBy: "u1" },
    };
    await dispatch(record, send);
    expect(send).toHaveBeenCalledWith(record);
  });

  it("new users (all defaults true) receive all three notification types", async () => {
    mockFindById.mockResolvedValue({
      notify_new_comment: true,
      notify_mention: true,
      notify_digest: true,
    });
    for (const type of ["new_comment", "mention", "digest"] as const) {
      const record: NotificationRecord = {
        id: `evt-${type}`,
        recipientId: "new-user",
        type,
        payload: {},
      };
      await dispatch(record, send);
    }
    expect(send).toHaveBeenCalledTimes(3);
  });
});
