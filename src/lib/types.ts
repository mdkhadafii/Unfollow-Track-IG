export type Snapshot = {
  id: string;
  accountLabel: string;
  capturedAt?: string;
  importedAt: string;
  followers: string[];
  following?: string[];
  sourceNames: string[];
  warnings?: string[];
};

export type RelationKind = "not-following-back" | "mutual" | "unfollowed" | "new-follower";

export type AccountResult = {
  username: string;
  category: RelationKind;
  profileUrl: string;
  snapshotOld?: string;
  snapshotNew?: string;
  comparisonPeriod?: string;
};

export type ImportedRelations = {
  followers: string[];
  following: string[];
  sourceNames: string[];
  warnings: string[];
};
