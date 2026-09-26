import { create } from "zustand";
import { archiveRestorationPlan, fetchRestorationArchiveDiff, listRestorationArchiveByPlan, reopenRestorationPlan } from "../api/RestorationArchive";
import type { ArchiveDiffEntry, RestorationArchive } from "../types/RestorationArchive";

type State = {
  versions: Record<number, RestorationArchive[]>;
  diffs: Record<number, ArchiveDiffEntry[]>;
  loading: boolean;
  error: string | null;
  loadPlan: (planId: number) => Promise<void>;
  archive: (planId: number) => Promise<void>;
  reopen: (planId: number) => Promise<void>;
};

export const useRestorationArchiveStore = create<State>((set, get) => ({
  versions: {},
  diffs: {},
  loading: false,
  error: null,
  async loadPlan(planId) {
    set({ loading: true });
    const [versions, diffs] = await Promise.all([listRestorationArchiveByPlan(planId), fetchRestorationArchiveDiff(planId)]);
    set((state) => ({ versions: { ...state.versions, [planId]: versions }, diffs: { ...state.diffs, [planId]: diffs }, loading: false }));
  },
  async archive(planId) {
    set({ loading: true, error: null });
    try {
      await archiveRestorationPlan(planId);
      await get().loadPlan(planId);
    } catch (err) {
      set({ loading: false, error: err instanceof Error ? err.message : String(err) });
    }
  },
  async reopen(planId) {
    set({ loading: true, error: null });
    try {
      await reopenRestorationPlan(planId);
      await get().loadPlan(planId);
    } catch (err) {
      set({ loading: false, error: err instanceof Error ? err.message : String(err) });
    }
  }
}));
