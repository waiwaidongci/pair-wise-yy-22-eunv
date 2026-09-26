import type { RestorationPlan } from "../types/RestorationPlan";
import type { RestorationStep } from "../types/RestorationStep";
import type { ImageVersion } from "../types/ImageVersion";
import type { PlanArchive } from "../types/PlanArchive";
import type { ArchiveDiffEntry } from "../types/ArchiveDiff";

const STEP_DIFF_FIELDS: (keyof RestorationStep)[] = ["technique", "material_used", "step_status", "finished_at"];
const IMAGE_DIFF_FIELDS: (keyof ImageVersion)[] = ["version_no", "image_type", "note", "capture_at"];

// 待复核差异：最新档案快照（生成时内容）与当前来源记录逐项对比，档案本身不被改写。
export function computePendingDiff(plan: RestorationPlan, liveSteps: RestorationStep[], liveImages: ImageVersion[], archive: PlanArchive): ArchiveDiffEntry[] {
  const diffs: ArchiveDiffEntry[] = [];
  (["plan_title", "method", "risk_assessment"] as const).forEach((field) => {
    if (String(plan[field]) !== String(archive[field])) diffs.push({ kind: "PLAN_FIELD", target: plan.plan_title, field, archived: String(archive[field]), current: String(plan[field]) });
  });
  const archivedSteps = JSON.parse(archive.steps_snapshot) as RestorationStep[];
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
  const archivedImages = JSON.parse(archive.images_snapshot) as ImageVersion[];
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
}
