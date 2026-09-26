export type RestorationArchivePayload = Record<string, unknown>;

export interface ArchiveDiffEntry {
  scope: "plan" | "step" | "image";
  target_id: number;
  field: string;
  archived_value: string;
  current_value: string;
}
