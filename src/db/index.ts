import { UserProfile } from "../models/userProfile";

/** Thin DB access interface — swap with your ORM/query builder. */
export const db = {
  userProfiles: {
    findById: (_id: string): Promise<UserProfile> => {
      throw new Error("Not implemented — replace with real DB client.");
    },
    update: (_id: string, _cols: Partial<UserProfile>): Promise<void> => {
      throw new Error("Not implemented — replace with real DB client.");
    },
  },
};
