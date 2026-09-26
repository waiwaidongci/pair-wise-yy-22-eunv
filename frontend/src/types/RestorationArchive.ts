import type { RestorationStep } from "./RestorationStep";
import type { ImageVersion } from "./ImageVersion";

export interface RestorationArchive {
  id: number;
  plan_id: number;
  archive_no: number;
  plan_title: string;
  method: string;
  risk_assessment: string;
  approval_status: string;
  owner_id: number;
  steps: RestorationStep[];
  images: ImageVersion[];
  archived_by: number;
  archived_at: string;
}

export interface ArchiveDiffEntry {
  scope: "plan" | "step" | "image";
  target_id: number;
  field: string;
  archived_value: string;
  current_value: string;
}
