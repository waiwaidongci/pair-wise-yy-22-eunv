import { create } from "zustand";
import { archivePlan, fetchPendingDiff, getPlanArchive, listPlanArchive } from "../api/PlanArchive";
import type { PlanArchive, PlanArchiveView } from "../types/PlanArchive";
import type { PendingDiff } from "../types/ArchiveDiff";

type State = {
  archives: PlanArchive[];
  current: PlanArchiveView | null;
  diff: PendingDiff | null;
  loading: boolean;
  loadArchives: (planId: number) => Promise<void>;
  openArchive: (id: number) => Promise<void>;
  loadDiff: (planId: number) => Promise<void>;
  archive: (planId: number) => Promise<PlanArchive | null>;
};

export const usePlanArchiveStore = create<State>((set, get) => ({
  archives: [],
  current: null,
  diff: null,
  loading: false,
  async loadArchives(planId) {
    set({ loading: true });
    set({ archives: await listPlanArchive(planId), loading: false });
  },
  async openArchive(id) {
    set({ current: await getPlanArchive(id) });
  },
  async loadDiff(planId) {
    set({ diff: await fetchPendingDiff(planId) });
  },
  async archive(planId) {
    const created = await archivePlan(planId);
    if (created) await get().loadArchives(planId);
    return created;
  }
}));
