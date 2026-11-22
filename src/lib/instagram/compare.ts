import type { AccountResult, Snapshot } from "@/lib/types";
import { profileUrl } from "@/lib/instagram/normalize";

export function analyzeSnapshot(snapshot: Snapshot) {
  const followers = new Set(snapshot.followers);
  const following = new Set(snapshot.following ?? []);

  const notFollowingBack = [...following].filter((username) => !followers.has(username));
  const mutualFollowers = [...following].filter((username) => followers.has(username));

  return {
    totalFollowers: followers.size,
    totalFollowing: following.size,
    notFollowingBack,
    mutualFollowers,
  };
}

function snapshotLabel(snapshot: Snapshot): string {
  return snapshot.capturedAt || "Tanggal tidak diketahui";
}

export function compareSnapshots(older: Snapshot, newer: Snapshot) {
  const olderFollowers = new Set(older.followers);
  const newerFollowers = new Set(newer.followers);
  const period = `${snapshotLabel(older)} – ${snapshotLabel(newer)}`;

  const toResults = (
    usernames: string[],
    category: AccountResult["category"],
  ): AccountResult[] =>
    usernames.map((username) => ({
      username,
      category,
      profileUrl: profileUrl(username) ?? "",
      snapshotOld: snapshotLabel(older),
      snapshotNew: snapshotLabel(newer),
      comparisonPeriod: period,
    }));

  return {
    unfollowers: toResults(
      [...olderFollowers].filter((username) => !newerFollowers.has(username)),
      "unfollowed",
    ),
    newFollowers: toResults(
      [...newerFollowers].filter((username) => !olderFollowers.has(username)),
      "new-follower",
    ),
  };
}

export function relationResults(usernames: string[], category: "not-following-back" | "mutual"): AccountResult[] {
  return usernames.map((username) => ({
    username,
    category,
    profileUrl: profileUrl(username) ?? "",
  }));
}
