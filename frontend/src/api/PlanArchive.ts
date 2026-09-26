import { mockData } from "../mocks/seedData";
import type { PlanArchive, PlanArchiveView } from "../types/PlanArchive";
import type { PendingDiff } from "../types/ArchiveDiff";
import type { RestorationPlan } from "../types/RestorationPlan";
import type { RestorationStep } from "../types/RestorationStep";
import type { ImageVersion } from "../types/ImageVersion";
import { computePendingDiff } from "../utils/archiveDiff";

const endpoint = "/api/plan-archive";

const mockArchives = () => [...(mockData.planArchive as unknown as PlanArchive[])];

export async function listPlanArchive(planId?: number): Promise<PlanArchive[]> {
  if (typeof fetch !== "undefined" && endpoint.startsWith("/api")) {
    try {
      const res = await fetch(planId === undefined ? endpoint : `${endpoint}?plan_id=${planId}`);
      if (res.ok) return await res.json();
    } catch {
      // Local mock fallback keeps the UI available during offline review.
    }
  }
  const rows = mockArchives();
  return planId === undefined ? rows : rows.filter((row) => row.plan_id === planId);
}

export async function getPlanArchive(id: number): Promise<PlanArchiveView | null> {
  if (typeof fetch !== "undefined" && endpoint.startsWith("/api")) {
    try {
      const res = await fetch(`${endpoint}/${id}`);
      if (res.ok) return await res.json();
    } catch {
      // Local mock fallback keeps the UI available during offline review.
    }
  }
  const found = mockArchives().find((row) => row.id === id);
  if (!found) return null;
  return {
    ...found,
    steps: JSON.parse(found.steps_snapshot) as RestorationStep[],
    images: JSON.parse(found.images_snapshot) as ImageVersion[]
  };
}

export async function fetchPendingDiff(planId: number): Promise<PendingDiff> {
  if (typeof fetch !== "undefined" && endpoint.startsWith("/api")) {
    try {
      const res = await fetch(`${endpoint}/plan/${planId}/diff`);
      if (res.ok) return await res.json();
    } catch {
      // Local mock fallback keeps the UI available during offline review.
    }
  }
  const plan = (mockData.restorationPlan as unknown as RestorationPlan[]).find((row) => row.id === planId);
  const latest = mockArchives().filter((row) => row.plan_id === planId).sort((a, b) => b.archive_version - a.archive_version)[0] ?? null;
  const steps = (mockData.restorationStep as unknown as RestorationStep[]).filter((row) => row.plan_id === planId);
  const images = (mockData.imageVersion as unknown as ImageVersion[]).filter((row) => row.plan_id === planId);
  return {
    plan_id: planId,
    archive_version: latest?.archive_version ?? null,
    diffs: plan && latest ? computePendingDiff(plan, steps, images, latest) : []
  };
}

export async function archivePlan(planId: number): Promise<PlanArchive | null> {
  if (typeof fetch !== "undefined" && endpoint.startsWith("/api")) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_id: planId })
      });
      if (res.ok) return await res.json();
    } catch {
      // Local mock fallback keeps the UI available during offline review.
    }
  }
  console.info("archive RestorationPlan", planId);
  return null;
}
