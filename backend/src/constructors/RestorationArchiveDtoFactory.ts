import type { RestorationPlan } from "../models/RestorationPlan";
import type { RestorationStep } from "../models/RestorationStep";
import type { ImageVersion } from "../models/ImageVersion";
import type { RestorationArchive } from "../models/RestorationArchive";

export const createRestorationArchiveDto = (overrides = {}) => ({ id: 1, plan_id: 1, archive_no: 1, plan_title: "plan title 1", method: "method 1", risk_assessment: "risk assessment 1", approval_status: "ARCHIVED", owner_id: 1, steps: [] as RestorationStep[], images: [] as ImageVersion[], archived_by: 1, archived_at: "2026-06-12T09:00:00Z", ...overrides });

// Snapshot the plan plus its steps and image versions exactly as they are at archive time.
export const createRestorationArchiveSnapshot = (plan: RestorationPlan, steps: RestorationStep[], images: ImageVersion[], overrides = {}): RestorationArchive =>
  createRestorationArchiveDto({
    plan_id: plan.id,
    plan_title: plan.plan_title,
    method: plan.method,
    risk_assessment: plan.risk_assessment,
    owner_id: plan.owner_id,
    steps: steps.map((step) => ({ ...step })),
    images: images.map((image) => ({ ...image })),
    ...overrides
  }) as RestorationArchive;
