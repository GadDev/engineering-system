import { dispatch, NotificationRecord } from "../../src/services/notificationDispatcher";
import { db } from "../../src/db";

jest.mock("../../src/db");

const mockFindById = db.userProfiles.findById as jest.Mock;

function makeRecord(
  type: NotificationRecord["type"],
  recipientId = "u1"
): NotificationRecord {
  return { id: "n1", recipientId, type, payload: {} };
}

describe("dispatch", () => {
  const send = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => jest.clearAllMocks());

  it("calls send when new_comment preference is enabled", async () => {
    mockFindById.mockResolvedValue({
      notify_new_comment: true,
      notify_mention: true,
      notify_digest: true,
    });
    await dispatch(makeRecord("new_comment"), send);
    expect(send).toHaveBeenCalledTimes(1);
  });

  it("suppresses delivery when new_comment preference is disabled", async () => {
    mockFindById.mockResolvedValue({
      notify_new_comment: false,
      notify_mention: true,
      notify_digest: true,
    });
    await dispatch(makeRecord("new_comment"), send);
    expect(send).not.toHaveBeenCalled();
  });

  it("calls send when mention preference is enabled", async () => {
    mockFindById.mockResolvedValue({
      notify_new_comment: true,
      notify_mention: true,
      notify_digest: true,
    });
    await dispatch(makeRecord("mention"), send);
    expect(send).toHaveBeenCalledTimes(1);
  });

  it("suppresses delivery when mention preference is disabled", async () => {
    mockFindById.mockResolvedValue({
      notify_new_comment: true,
      notify_mention: false,
      notify_digest: true,
    });
    await dispatch(makeRecord("mention"), send);
    expect(send).not.toHaveBeenCalled();
  });

  it("calls send when digest preference is enabled", async () => {
    mockFindById.mockResolvedValue({
      notify_new_comment: true,
      notify_mention: true,
      notify_digest: true,
    });
    await dispatch(makeRecord("digest"), send);
    expect(send).toHaveBeenCalledTimes(1);
  });

  it("suppresses delivery when digest preference is disabled", async () => {
    mockFindById.mockResolvedValue({
      notify_new_comment: true,
      notify_mention: true,
      notify_digest: false,
    });
    await dispatch(makeRecord("digest"), send);
    expect(send).not.toHaveBeenCalled();
  });
});
