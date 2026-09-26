import { planArchiveRepository } from "../repositories/PlanArchiveRepository";
import { restorationPlanRepository } from "../repositories/RestorationPlanRepository";
import { restorationStepRepository } from "../repositories/RestorationStepRepository";
import { imageVersionRepository } from "../repositories/ImageVersionRepository";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { createPlanArchiveDto } from "../constructors/PlanArchiveDtoFactory";
import { toAuditTarget } from "../utils/formatters";
import type { PlanArchive } from "../models/PlanArchive";
import type { RestorationPlan } from "../models/RestorationPlan";
import type { RestorationStep } from "../models/RestorationStep";
import type { ImageVersion } from "../models/ImageVersion";
import type { ArchiveDiffKind } from "../constants/ArchiveDiffKind";

type DiffEntry = { kind: ArchiveDiffKind; target: string; field: string; archived: string; current: string };

const httpError = (status: number, code: keyof typeof ERROR_CODES) => Object.assign(new Error(ERROR_MESSAGES[code]), { status, code: ERROR_CODES[code] });

const STEP_DIFF_FIELDS: (keyof RestorationStep)[] = ["technique", "material_used", "step_status", "finished_at"];
const IMAGE_DIFF_FIELDS: (keyof ImageVersion)[] = ["version_no", "image_type", "note", "capture_at"];

const parseSteps = (archive: PlanArchive) => JSON.parse(archive.steps_snapshot) as RestorationStep[];
const parseImages = (archive: PlanArchive) => JSON.parse(archive.images_snapshot) as ImageVersion[];

const toView = (archive: PlanArchive) => ({ ...archive, steps: parseSteps(archive), images: parseImages(archive) });

// 待复核差异：最新档案快照（生成时内容）与当前来源记录逐项对比，档案本身不被改写。
const computePendingDiff = (plan: RestorationPlan, liveSteps: RestorationStep[], liveImages: ImageVersion[], archive: PlanArchive): DiffEntry[] => {
  const diffs: DiffEntry[] = [];
  (["plan_title", "method", "risk_assessment"] as const).forEach((field) => {
    if (String(plan[field]) !== String(archive[field])) diffs.push({ kind: "PLAN_FIELD", target: plan.plan_title, field, archived: String(archive[field]), current: String(plan[field]) });
  });
  const archivedSteps = parseSteps(archive);
  const archivedStepMap = new Map(archivedSteps.map((step) => [step.id, step]));
  const liveStepMap = new Map(liveSteps.map((step) => [step.id, step]));
  liveSteps.forEach((step) => {
    const before = archivedStepMap.get(step.id);
    if (!before) {
      diffs.push({ kind: "STEP_ADDED", target: `步骤#${step.id}（${step.step_order}）`, field: "-", archived: "", current: `${step.technique} / ${step.material_used}` });
      return;
    }
    STEP_DIFF_FIELDS.forEach((field) => {
      if (String(before[field]) !== String(step[field])) diffs.push({ kind: "STEP_CHANGED", target: `步骤#${step.id}（${step.step_order}）`, field, archived: String(before[field]), current: String(step[field]) });
    });
  });
  archivedSteps.forEach((step) => {
    if (!liveStepMap.has(step.id)) diffs.push({ kind: "STEP_REMOVED", target: `步骤#${step.id}（${step.step_order}）`, field: "-", archived: `${step.technique} / ${step.material_used}`, current: "" });
  });
  const archivedImages = parseImages(archive);
  const archivedImageMap = new Map(archivedImages.map((image) => [image.id, image]));
  const liveImageMap = new Map(liveImages.map((image) => [image.id, image]));
  liveImages.forEach((image) => {
    const before = archivedImageMap.get(image.id);
    if (!before) {
      diffs.push({ kind: "IMAGE_ADDED", target: `影像#${image.id}（${image.version_no}）`, field: "-", archived: "", current: `${image.image_type} / ${image.note}` });
      return;
    }
    IMAGE_DIFF_FIELDS.forEach((field) => {
      if (String(before[field]) !== String(image[field])) diffs.push({ kind: "IMAGE_CHANGED", target: `影像#${image.id}（${image.version_no}）`, field, archived: String(before[field]), current: String(image[field]) });
    });
  });
  archivedImages.forEach((image) => {
    if (!liveImageMap.has(image.id)) diffs.push({ kind: "IMAGE_REMOVED", target: `影像#${image.id}（${image.version_no}）`, field: "-", archived: `${image.image_type} / ${image.note}`, current: "" });
  });
  return diffs;
};

export const planArchiveService = {
  list: (planId?: number) => (planId === undefined ? planArchiveRepository.findAll() : planArchiveRepository.findByPlanId(planId)),
  get: (id: number) => {
    const archive = planArchiveRepository.findById(id);
    if (!archive) throw httpError(404, "ARCHIVE_NOT_FOUND");
    console.info(LOG_TEMPLATES.PlanArchive[1], toAuditTarget("PlanArchive", id));
    return toView(archive);
  },
  // 归档：把生成当时的方案方法、风险说明、全部步骤和对应影像版本整体快照，之后档案只读。
  archive: (planId: number, actor: string) => {
    const plan = restorationPlanRepository.findById(planId);
    if (!plan) throw httpError(404, "PLAN_NOT_FOUND");
    if (plan.approval_status === "ARCHIVED") throw httpError(409, "PLAN_ALREADY_ARCHIVED");
    const archive = createPlanArchiveDto({
      id: planArchiveRepository.nextId(),
      plan_id: planId,
      archive_version: plan.version_no,
      plan_title: plan.plan_title,
      method: plan.method,
      risk_assessment: plan.risk_assessment,
      steps_snapshot: JSON.stringify(restorationStepRepository.findByPlanId(planId)),
      images_snapshot: JSON.stringify(imageVersionRepository.findByPlanId(planId)),
      archived_by: actor,
      archived_at: new Date().toISOString()
    });
    planArchiveRepository.save(archive);
    restorationPlanRepository.update(planId, { approval_status: "ARCHIVED" });
    console.info(LOG_TEMPLATES.PlanArchive[0], toAuditTarget("PlanArchive", archive.id));
    return archive;
  },
  pendingDiff: (planId: number) => {
    const plan = restorationPlanRepository.findById(planId);
    if (!plan) throw httpError(404, "PLAN_NOT_FOUND");
    const latest = planArchiveRepository.findByPlanId(planId).sort((a, b) => b.archive_version - a.archive_version)[0];
    if (!latest) return { plan_id: planId, archive_version: null, diffs: [] as DiffEntry[] };
    const diffs = computePendingDiff(plan, restorationStepRepository.findByPlanId(planId), imageVersionRepository.findByPlanId(planId), latest);
    console.info(LOG_TEMPLATES.PlanArchive[2], toAuditTarget("RestorationPlan", planId));
    return { plan_id: planId, archive_version: latest.archive_version, diffs };
  }
};
