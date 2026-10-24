export type KeepsakeMood = "soft" | "happy" | "grateful";

export type KeepsakeRecord = {
  id: string;
  text: string;
  /** ISO-8601 timestamp, always normalized with toISOString(). */
  createdAt: string;
  mood: KeepsakeMood;
};

export type KeepsakeExport = {
  schemaVersion: 1;
  exportedAt: string;
  items: KeepsakeRecord[];
};
