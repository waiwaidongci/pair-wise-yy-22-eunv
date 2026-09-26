import type { PlanArchive } from "../types/PlanArchive";

export const createDefaultPlanArchive = (overrides: Partial<PlanArchive> = {}): PlanArchive => ({
  id: 1 as never,
  plan_id: 1 as never,
  archive_version: 1 as never,
  plan_title: "plan title 1" as never,
  method: "method 1" as never,
  risk_assessment: "risk assessment 1" as never,
  steps_snapshot: "[]" as never,
  images_snapshot: "[]" as never,
  archived_by: "archivist 1" as never,
  archived_at: "2026-06-20T09:00:00Z" as never,
  ...overrides
});

export const createPlanArchiveForm = createDefaultPlanArchive;
export const createPlanArchiveResponse = createDefaultPlanArchive;
