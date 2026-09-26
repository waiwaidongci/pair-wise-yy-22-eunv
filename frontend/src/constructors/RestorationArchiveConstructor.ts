import type { RestorationArchive } from "../types/RestorationArchive";

export const createDefaultRestorationArchive = (overrides: Partial<RestorationArchive> = {}): RestorationArchive => ({
  id: 1 as never,
  plan_id: 1 as never,
  archive_no: 1 as never,
  plan_title: "plan title 1" as never,
  method: "method 1" as never,
  risk_assessment: "risk assessment 1" as never,
  approval_status: "ARCHIVED" as never,
  owner_id: 1 as never,
  steps: [] as never,
  images: [] as never,
  archived_by: 1 as never,
  archived_at: "2026-06-12T09:00:00Z" as never,
  ...overrides
});

export const createRestorationArchiveForm = createDefaultRestorationArchive;
export const createRestorationArchiveResponse = createDefaultRestorationArchive;
