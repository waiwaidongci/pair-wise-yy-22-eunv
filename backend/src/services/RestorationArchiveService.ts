import { restorationArchiveRepository } from "../repositories/RestorationArchiveRepository";
import { restorationPlanRepository } from "../repositories/RestorationPlanRepository";
import { restorationStepRepository } from "../repositories/RestorationStepRepository";
import { imageVersionRepository } from "../repositories/ImageVersionRepository";
import { createRestorationArchiveSnapshot } from "../constructors/RestorationArchiveDtoFactory";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { toAuditTarget } from "../utils/formatters";
import type { RestorationArchive } from "../models/RestorationArchive";
import type { ArchiveDiffEntry } from "../types/RestorationArchivePayload";

const fail = (code: keyof typeof ERROR_CODES, status = 400): never => {
  throw { status, code, message: ERROR_MESSAGES[code] };
};

const diffField = (entries: ArchiveDiffEntry[], scope: ArchiveDiffEntry["scope"], targetId: number, field: string, archived: unknown, current: unknown) => {
  const archivedValue = String(archived ?? "");
  const currentValue = String(current ?? "");
  if (archivedValue !== currentValue) entries.push({ scope, target_id: targetId, field, archived_value: archivedValue, current_value: currentValue });
};

export const restorationArchiveService = {
  list: () => restorationArchiveRepository.findAll(),

  listByPlan: (planId: number) => restorationArchiveRepository.findByPlanId(planId),

  get: (id: number) => restorationArchiveRepository.findById(id) ?? fail(ERROR_CODES.ARCHIVE_NOT_FOUND, 404),

  // Freeze the plan as a complete archive: method, risk note, all steps and image versions as of now.
  archive: (planId: number, actorId: number): RestorationArchive => {
    const plan = restorationPlanRepository.findById(planId) ?? fail(ERROR_CODES.PLAN_NOT_FOUND, 404);
    if (plan.approval_status === "ARCHIVED") fail(ERROR_CODES.PLAN_ALREADY_ARCHIVED, 409);
    const snapshot = createRestorationArchiveSnapshot(
      plan,
      restorationStepRepository.findByPlanId(planId),
      imageVersionRepository.findByPlanId(planId),
      { id: restorationArchiveRepository.nextId(), archive_no: restorationArchiveRepository.nextArchiveNo(planId), archived_by: actorId, archived_at: new Date().toISOString() }
    );
    restorationPlanRepository.update(planId, { approval_status: "ARCHIVED" });
    console.info(LOG_TEMPLATES.RestorationArchive[0], toAuditTarget("RestorationPlan", planId), `v${snapshot.archive_no}`);
    return restorationArchiveRepository.save(snapshot);
  },

  // Reopen an archived plan as a new working version; old archives stay untouched for review.
  reopen: (planId: number, actorId: number) => {
    const plan = restorationPlanRepository.findById(planId) ?? fail(ERROR_CODES.PLAN_NOT_FOUND, 404);
    if (plan.approval_status !== "ARCHIVED") fail(ERROR_CODES.PLAN_NOT_ARCHIVED, 409);
    restorationPlanRepository.update(planId, { approval_status: "DRAFT" });
    console.info(LOG_TEMPLATES.RestorationArchive[1], toAuditTarget("RestorationPlan", planId), `actor#${actorId}`);
    return { plan: restorationPlanRepository.findById(planId), next_archive_no: restorationArchiveRepository.nextArchiveNo(planId) };
  },

  // Pending-review differences between the latest archive snapshot and the live source records.
  diff: (planId: number): ArchiveDiffEntry[] => {
    const plan = restorationPlanRepository.findById(planId) ?? fail(ERROR_CODES.PLAN_NOT_FOUND, 404);
    const [latest] = restorationArchiveRepository.findByPlanId(planId);
    if (!latest) return [];
    const entries: ArchiveDiffEntry[] = [];
    diffField(entries, "plan", plan.id, "plan_title", latest.plan_title, plan.plan_title);
    diffField(entries, "plan", plan.id, "method", latest.method, plan.method);
    diffField(entries, "plan", plan.id, "risk_assessment", latest.risk_assessment, plan.risk_assessment);
    const archivedSteps = new Map(latest.steps.map((step) => [step.id, step]));
    for (const step of restorationStepRepository.findByPlanId(planId)) {
      const archived = archivedSteps.get(step.id);
      if (!archived) { entries.push({ scope: "step", target_id: step.id, field: "step", archived_value: "", current_value: `${step.step_order} ${step.technique}` }); continue; }
      diffField(entries, "step", step.id, "technique", archived.technique, step.technique);
      diffField(entries, "step", step.id, "material_used", archived.material_used, step.material_used);
      diffField(entries, "step", step.id, "step_status", archived.step_status, step.step_status);
      archivedSteps.delete(step.id);
    }
    for (const removed of archivedSteps.values()) entries.push({ scope: "step", target_id: removed.id, field: "step", archived_value: `${removed.step_order} ${removed.technique}`, current_value: "" });
    const archivedImages = new Map(latest.images.map((image) => [image.id, image]));
    for (const image of imageVersionRepository.findByPlanId(planId)) {
      const archived = archivedImages.get(image.id);
      if (!archived) { entries.push({ scope: "image", target_id: image.id, field: "image", archived_value: "", current_value: image.version_no }); continue; }
      diffField(entries, "image", image.id, "version_no", archived.version_no, image.version_no);
      diffField(entries, "image", image.id, "file_path", archived.file_path, image.file_path);
      diffField(entries, "image", image.id, "note", archived.note, image.note);
      archivedImages.delete(image.id);
    }
    for (const removed of archivedImages.values()) entries.push({ scope: "image", target_id: removed.id, field: "image", archived_value: removed.version_no, current_value: "" });
    console.info(LOG_TEMPLATES.RestorationArchive[2], toAuditTarget("RestorationPlan", planId), `${entries.length} pending`);
    return entries;
  }
};
