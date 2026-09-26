import { mockData } from "../mocks/seedData";
import type { RestorationPlan } from "../types/RestorationPlan";

const endpoint = "/api/restoration-plan";

export async function listRestorationPlan(): Promise<RestorationPlan[]> {
  if (typeof fetch !== "undefined" && endpoint.startsWith("/api") && true) {
    try {
      const res = await fetch(endpoint);
      if (res.ok) return await res.json();
    } catch {
      // Local mock fallback keeps the UI available during offline review.
    }
  }
  return [...(mockData.restorationPlan as unknown as RestorationPlan[])];
}

export async function saveRestorationPlan(payload: RestorationPlan) {
  console.info("save RestorationPlan", payload);
  return payload;
}

// 已归档方案另存为新版本后才能继续修复，旧档案按版本留查。
export async function saveRestorationPlanAsNewVersion(planId: number): Promise<RestorationPlan | null> {
  if (typeof fetch !== "undefined" && endpoint.startsWith("/api")) {
    try {
      const res = await fetch(`${endpoint}/${planId}/new-version`, { method: "POST" });
      if (res.ok) return await res.json();
    } catch {
      // Local mock fallback keeps the UI available during offline review.
    }
  }
  console.info("save RestorationPlan as new version", planId);
  return null;
}
