import type { ArchiveDiffKind } from "../constants/ArchiveDiffKind";

export interface ArchiveDiffEntry {
  kind: ArchiveDiffKind;
  target: string;
  field: string;
  archived: string;
  current: string;
}

export interface PendingDiff {
  plan_id: number;
  archive_version: number | null;
  diffs: ArchiveDiffEntry[];
}
