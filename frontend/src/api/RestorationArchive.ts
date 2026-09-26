import { mockData } from "../mocks/seedData";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { createDefaultRestorationArchive } from "../constructors/RestorationArchiveConstructor";
import type { ArchiveDiffEntry, RestorationArchive } from "../types/RestorationArchive";

const endpoint = "/api/restoration-archive";

const mockArchives = () => [...(mockData.restorationArchive as unknown as RestorationArchive[])];

const raiseBusinessError = async (res: Response): Promise<never> => {
  const body = await res.json().catch(() => null);
  const code = body?.code as keyof typeof ERROR_MESSAGES | undefined;
  throw new Error((code && ERROR_MESSAGES[code]) ?? body?.message ?? "请求失败");
};

export async function listRestorationArchive(): Promise<RestorationArchive[]> {
  if (typeof fetch !== "undefined" && endpoint.startsWith("/api") && true) {
    try {
      const res = await fetch(endpoint);
      if (res.ok) return await res.json();
    } catch {
      // Local mock fallback keeps the UI available during offline review.
    }
  }
  return mockArchives();
}

export async function listRestorationArchiveByPlan(planId: number): Promise<RestorationArchive[]> {
  if (typeof fetch !== "undefined" && endpoint.startsWith("/api") && true) {
    try {
      const res = await fetch(`${endpoint}/plan/${planId}`);
      if (res.ok) return await res.json();
    } catch {
      // Local mock fallback keeps the UI available during offline review.
    }
  }
  return mockArchives().filter((row) => row.plan_id === planId).sort((a, b) => b.archive_no - a.archive_no);
}

export async function fetchRestorationArchiveDiff(planId: number): Promise<ArchiveDiffEntry[]> {
  if (typeof fetch !== "undefined" && endpoint.startsWith("/api") && true) {
    try {
      const res = await fetch(`${endpoint}/plan/${planId}/diff`);
      if (res.ok) return await res.json();
    } catch {
      // Local mock fallback keeps the UI available during offline review.
    }
  }
  return [];
}

export async function archiveRestorationPlan(planId: number): Promise<RestorationArchive | null> {
  console.info(LOG_TEMPLATES.RestorationArchive[0], planId);
  try {
    const res = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan_id: planId }) });
    if (res.ok) return await res.json();
    return await raiseBusinessError(res);
  } catch (err) {
    if (err instanceof TypeError) return createDefaultRestorationArchive({ plan_id: planId, archived_at: new Date().toISOString() });
    throw err;
  }
}

export async function reopenRestorationPlan(planId: number): Promise<{ next_archive_no: number } | null> {
  console.info(LOG_TEMPLATES.RestorationArchive[1], planId);
  try {
    const res = await fetch(`${endpoint}/reopen`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan_id: planId }) });
    if (res.ok) return await res.json();
    return await raiseBusinessError(res);
  } catch (err) {
    if (err instanceof TypeError) return { next_archive_no: mockArchives().filter((row) => row.plan_id === planId).length + 1 };
    throw err;
  }
}
