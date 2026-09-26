import type { RestorationStep } from "./RestorationStep";
import type { ImageVersion } from "./ImageVersion";

export interface PlanArchive {
  id: number;
  plan_id: number;
  archive_version: number;
  plan_title: string;
  method: string;
  risk_assessment: string;
  steps_snapshot: string;
  images_snapshot: string;
  archived_by: string;
  archived_at: string;
}

export interface PlanArchiveView extends PlanArchive {
  steps: RestorationStep[];
  images: ImageVersion[];
}
