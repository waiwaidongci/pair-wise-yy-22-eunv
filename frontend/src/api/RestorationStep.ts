import { mockData } from "../mocks/seedData";
import type { RestorationStep } from "../types/RestorationStep";

const endpoint = "/api/restoration-step";

export async function listRestorationStep(): Promise<RestorationStep[]> {
  if (typeof fetch !== "undefined" && endpoint.startsWith("/api") && true) {
    try {
      const res = await fetch(endpoint);
      if (res.ok) return await res.json();
    } catch {
      // Local mock fallback keeps the UI available during offline review.
    }
  }
  return [...(mockData.restorationStep as unknown as RestorationStep[])];
}

export async function saveRestorationStep(payload: RestorationStep) {
  console.info("save RestorationStep", payload);
  return payload;
}

// 来源记录的补录更正：只改来源，不改写已生成的修复档案。
export async function updateRestorationStep(id: number, patch: Partial<RestorationStep>) {
  if (typeof fetch !== "undefined" && endpoint.startsWith("/api")) {
    try {
      const res = await fetch(`${endpoint}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch)
      });
      if (res.ok) return await res.json();
    } catch {
      // Local mock fallback keeps the UI available during offline review.
    }
  }
  console.info("update RestorationStep", id, patch);
  return patch;
}
